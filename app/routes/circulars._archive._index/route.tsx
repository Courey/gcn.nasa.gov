/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import { Alert, Button, Icon, Label, TextInput } from '@trussworks/react-uswds'
import clamp from 'lodash/clamp'
import { useEffect, useId, useRef, useState } from 'react'

import { getUser } from '../_auth/user.server'
import {
  circularFormats
} from '../circulars/circulars.lib';
import type {
  CircularMetadata,
  CircularFormat
} from '../circulars/circulars.lib';
import {
  circularRedirect,
  createChangeRequest,
  get,
  getChangeRequest,
  getChangeRequests,
  moderatorGroup,
  put,
  putVersion,
  search,
} from '../circulars/circulars.server'
import CircularsHeader from './CircularsHeader'
import CircularsIndex from './CircularsIndex'
import { DateSelector } from './DateSelectorMenu'
import PaginationSelectionFooter from './PaginationSelectionFooter'
import { SortSelector } from './SortSelectorButton'
import Hint from '~/components/Hint'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { origin } from '~/lib/env.server'
import { getFormDataString } from '~/lib/utils'
import { postZendeskRequest } from '~/lib/zendesk.server'
import { useModStatus } from '~/root'
import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'
import { groupMembersByEventId } from '../synonyms/synonyms.server'
import SynonymGroupIndex from './SynonymGroupIndex'
import type { SynonymGroupWithMembers } from '../synonyms/synonyms.lib'

export async function loader({ request: { url } }: LoaderFunctionArgs) {
  console.log("LOADER STARTING ------->")
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  const view = searchParams.get('view') || 'index'
  if (query) {
    await circularRedirect(query)
  }
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  // const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)

  const limit = parseInt(calculateLimit(view, searchParams.get('limit') || '100'))
  const sort = searchParams.get('sort') || 'circularId'
  const searchFunction = (view != 'group') ? search : groupMembersByEventId
  const results = await searchFunction({
    query,
    page: page - 1,
    limit,
    startDate,
    endDate,
    sort,
  })
  const requestedChangeCount = (await getChangeRequests()).length
  console.log(`LOADER QUERY: ${query}`)
  console.log(`LOADER VIEW: ${view}`)
  console.log(`LOADER VIEW SEARCH PARAMS: ${searchParams.get('view')}`)
  console.log(`LOADER LIMIT: ${limit}`)
  console.log(`LOADER PAGE: ${page}`)
  console.log(`LOADER PAGE SEARCH PARAM: ${searchParams.get('page')}`)
  console.log("LOADER ENDING <--------")
  return { page, ...results, requestedChangeCount }
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("ACTION RAN!!!!!!!!!!!!!!!!")
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  const intent = getFormDataString(data, 'intent')
  const format = getFormDataString(data, 'format') as CircularFormat | undefined
  if (format && !circularFormats.includes(format)) {
    throw new Response('Invalid format', { status: 400 })
  }
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  const user = await getUser(request)
  const circularId = getFormDataString(data, 'circularId')
  const createdOnDate =
    getFormDataString(data, 'createdOn') || Date.now().toString()
  const createdOn = Date.parse(createdOnDate)

  let newCircular
  const props = { body, subject, ...(format ? { format } : {}) }
  switch (intent) {
    case 'correction':
      if (circularId === undefined)
        throw new Response('circularId is required', { status: 400 })

      if (!user?.name || !user.email) throw new Response(null, { status: 403 })
      let submitter
      if (user.groups.includes(moderatorGroup)) {
        submitter = getFormDataString(data, 'submitter')
        if (!submitter) throw new Response(null, { status: 400 })
      }

      if (!createdOnDate || !createdOn)
        throw new Response(null, { status: 400 })

      let zendeskTicketId: number | undefined

      try {
        zendeskTicketId = (
          await getChangeRequest(parseFloat(circularId), user.sub)
        ).zendeskTicketId
      } catch (err) {
        if (!(err instanceof Response && err.status === 404)) throw err
      }

      if (!zendeskTicketId) {
        zendeskTicketId = await postZendeskRequest({
          requester: { name: user.name, email: user.email },
          subject: `Change Request for Circular ${circularId}`,
          comment: {
            body: `${user.name} has requested an edit. Review at ${origin}/circulars`,
          },
        })
      }

      if (!zendeskTicketId) throw new Response(null, { status: 500 })

      await createChangeRequest(
        {
          circularId: parseFloat(circularId),
          ...props,
          submitter,
          createdOn,
          zendeskTicketId,
        },
        user
      )
      newCircular = null
      break
    case 'edit':
      if (circularId === undefined)
        throw new Response('circularId is required', { status: 400 })
      if (!createdOnDate || !createdOn)
        throw new Response(null, { status: 400 })
      await putVersion(
        {
          circularId: parseFloat(circularId),
          ...props,
          createdOn,
        },
        user
      )
      newCircular = await get(parseFloat(circularId))
      break
    case 'new':
      newCircular = await put({ ...props, submittedHow: 'web' }, user)
      break
    default:
      break
  }
  return { newCircular, intent }
}

function calculateLimit(view: string, limit: string){
  console.log(`CALCULATE LIMIT: ${limit}`)
  console.log(`CALCULATE VIEW: ${view}`)
  if (view === 'group'){
    console.log(`CALCULATED GROUP LIMIT: ${(parseInt(limit) > 20) ? '20' : limit}`)
    return (parseInt(limit) > 20) ? '20' : limit
  } else {
    return limit || "100"
  }
}

function handleSearchParams(searchParams: URLSearchParams){
  // Strip off the ?index param if we navigated here from a form.
  // See https://remix.run/docs/en/main/guides/index-query-param.
  searchParams.delete('index')
  const query = searchParams.get('query') || ''
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const sort = searchParams.get('sort') || 'circularID'
  const view = searchParams.get('view') || 'index'
  const initialLimit = calculateLimit(view, searchParams.get('limit') || '100')
  return {initialLimit, query, startDate, endDate, sort, view}
}

export default function () {
  const result = useActionData<typeof action>()
  const { items, page, totalPages, totalItems, requestedChangeCount } =
    useLoaderData<typeof loader>()

  // Concatenate items from the action and loader functions
  const allItems = [
    ...(result?.newCircular ? [result.newCircular] : []),
    ...(items || []),
  ]

  const [searchParams] = useSearchParams()
  const userIsModerator = useModStatus()
  const {initialLimit, query, startDate, endDate, sort, view} = handleSearchParams(searchParams)
  const groupView = view === 'group'
  const limit = initialLimit
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`
  console.log(`INDEX VIEW: ${view}`)
  console.log(`INDEX limit: ${limit}`)
  console.log(`INDEX groupView: ${groupView}`)
  console.log(`INDEX page: ${page}`)
  const [inputQuery, setInputQuery] = useState(query)
  const viewState = groupView ? "Index" : "Group"
  const clean = inputQuery === query

  const formId = useId()
  const submit = useSubmit()

  return (
    <>
      {result?.intent === 'correction' && (
        <Alert
          type="success"
          headingLevel="h1"
          slim
          heading="Request Submitted"
        >
          Thank you for your correction. A GCN Circulars moderator will review
          it shortly.
        </Alert>
      )}
      <CircularsHeader />
      {userIsModerator && requestedChangeCount > 0 && (
        <Link to="moderation" className="usa-button usa-button--outline">
          Review {requestedChangeCount} Requested Change
          {requestedChangeCount > 1 ? 's' : ''}
        </Link>
      )}
      <ToolbarButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1 z-300">
        <Form
          preventScrollReset
          className="display-inline-block usa-search usa-search--small"
          role="search"
          id={formId}
        >
          <Label srOnly htmlFor="query">
            Search
          </Label>
          <TextInput
            autoFocus
            className="minw-15"
            id="query"
            name="query"
            type="search"
            defaultValue={inputQuery}
            placeholder="Search"
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInputQuery(value)
              if (!value) submit(form, { preventScrollReset: true })
            }}
          />
          <Button type="submit">
            <img
              src={searchImg}
              className="usa-search__submit-icon"
              alt="Search"
            />
          </Button>
        </Form>
        <DateSelector
          form={formId}
          defaultStartDate={startDate}
          defaultEndDate={endDate}
        />
        {query && <SortSelector form={formId} defaultValue={sort} />}
        <Link to={`/circulars?view=${viewState.toLowerCase()}&limit=20`} preventScrollReset>
          <Button type='button' className="padding-y-1">{`${viewState} View`}</Button>
        </Link>
        <Link to={`/circulars/new${searchString}`}>
          <Button type="button" className="padding-y-1">
            <Icon.Edit role="presentation" /> New
          </Button>
        </Link>
      </ToolbarButtonGroup>
      <Hint id="searchHint">
        Search for Circulars by submitter, subject, or body text (e.g. 'Fermi
        GRB'). <br />
        To navigate to a specific circular, enter the associated Circular ID
        (e.g. 'gcn123', 'Circular 123', or '123').
      </Hint>
      {clean && (
        <>
          {!groupView && (
            <CircularsIndex
              allItems={allItems as CircularMetadata[]}
              searchString={searchString}
              totalItems={totalItems}
              query={query}
            />
          )}
          {groupView && (
            <SynonymGroupIndex
              allItems={items as SynonymGroupWithMembers[]}
              searchString={searchString}
              totalItems={totalItems}
              query={query}
            />
          )}
          <PaginationSelectionFooter
            query={query}
            page={page}
            limit={parseInt(limit)}
            totalPages={totalPages}
            formId={formId}
            view={view}
          />
        </>
      )}
    </>
  )
}
