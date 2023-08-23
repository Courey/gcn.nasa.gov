/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  DataFunctionArgs,
  HeadersFunction,
  SerializeFrom,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useRef, useState } from 'react'

import { formatDateISO } from './circulars/circulars.lib'
import { get, update } from './circulars/circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { getFormDataString, useSearchString } from '~/lib/utils'

export const handle = {
  breadcrumb({ data }: { data: SerializeFrom<typeof loader> }) {
    if (data) {
      const { circularId, subject } = data
      return `${circularId}: ${subject}`
    }
  },
}

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const result = await get(parseFloat(circularId))
  return json(result, {
    headers: getCanonicalUrlHeaders(
      new URL(`/circulars/${circularId}`, origin)
    ),
  })
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const circularId = getFormDataString(data, 'circular-id')
  const eventId = getFormDataString(data, 'event-id')
  const synonyms = getFormDataString(data, 'synonyms')
  const synonymsArray = synonyms ? synonyms.split(',') : []
  if (!circularId) return null

  const updatedCircular = await update(
    request,
    parseInt(circularId),
    eventId,
    synonymsArray
  )

  return updatedCircular
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

const submittedHowMap = {
  web: 'Web form',
  email: 'email',
  'email-legacy': 'legacy email',
}

function EditCircular({
  eventId,
  synonyms,
  subject,
}: {
  eventId?: string
  synonyms?: string[]
  subject: string
}) {
  const fetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null)
  const { circularId } = useLoaderData<typeof loader>()

  return (
    <>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>Subject</b>
        </Grid>
        <Grid col="fill">{subject}</Grid>
      </Grid>
      <fetcher.Form method="POST" ref={formRef}>
        <input type="hidden" name="circular-id" value={circularId} />
        <Label htmlFor="event-id">Event Id:</Label>
        <TextInput
          data-focus
          name="event-id"
          id="event-id"
          type="text"
          defaultValue={eventId}
          placeholder={eventId || 'Event Id'}
        />
        <Label htmlFor="synonyms">
          Alternate search terms (comma separated values):
        </Label>
        <TextInput
          data-focus
          name="synonyms"
          id="synonyms"
          type="text"
          defaultValue={synonyms}
          placeholder={synonyms?.toString() || 'Synonyms'}
        />
        <ButtonGroup className="margin-top-2">
          <Button type="submit">Save</Button>
        </ButtonGroup>
      </fetcher.Form>
    </>
  )
}

function ViewCircular({
  subject,
  submitter,
  createdOn,
  body,
  submittedHow,
}: {
  subject: string
  submitter: string
  createdOn: number
  body: string
  submittedHow: string
}) {
  return (
    <>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>Subject</b>
        </Grid>
        <Grid col="fill">{subject}</Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>Date</b>
        </Grid>
        <Grid col="fill">
          {formatDateISO(createdOn)}{' '}
          <small className="text-base-light">
            (<TimeAgo time={createdOn}></TimeAgo>)
          </small>
        </Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>From</b>
        </Grid>
        <Grid col="fill">{submitter}</Grid>
      </Grid>
      {submittedHow && (
        <Grid row>
          <Grid tablet={{ col: 2 }}>
            <b>Submitted By</b>
          </Grid>
          <Grid col="fill">
            {submittedHowMap[submittedHow as keyof typeof submittedHowMap]}
          </Grid>
        </Grid>
      )}
      <div className="text-pre-wrap margin-top-2">{body}</div>
    </>
  )
}

export default function () {
  const [isEdit, setIsEdit] = useState(false)
  const isModerator = true
  const {
    circularId,
    subject,
    submitter,
    createdOn,
    body,
    eventId,
    synonyms,
    submittedHow,
  } = useLoaderData<typeof loader>()
  const searchString = useSearchString()
  return (
    <>
      <ButtonGroup>
        <Link to={`/circulars${searchString}`} className="usa-button">
          <div className="position-relative">
            <Icon.ArrowBack className="position-absolute top-0 left-0" />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
        <ButtonGroup type="segmented">
          <Link
            to={`/circulars/${circularId}.txt`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            Text
          </Link>
          <Link
            to={`/circulars/${circularId}.json`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            JSON
          </Link>
          {isModerator && (
            <Button
              type="button"
              className="usa-button usa-button--outline"
              onClick={(e) => {
                setIsEdit(!isEdit)
              }}
            >
              Edit
            </Button>
          )}
        </ButtonGroup>
      </ButtonGroup>
      <h1>GCN Circular {circularId}</h1>
      {isEdit && (
        <EditCircular eventId={eventId} synonyms={synonyms} subject={subject} />
      )}
      {!isEdit && (
        <ViewCircular
          subject={subject}
          submitter={submitter}
          createdOn={createdOn}
          body={body}
          submittedHow={submittedHow || ''}
        />
      )}
    </>
  )
}
