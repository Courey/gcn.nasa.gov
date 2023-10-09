/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import {
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import {
  Select,
} from '@trussworks/react-uswds'
import clamp from 'lodash/clamp'
import { useState } from 'react'

import { circularRedirect, getCircularsGroupedBySynonyms, getUniqueSynonymsArrays, search } from '../circulars/circulars.server'
import type { action } from '../circulars/route'
import { useFeature } from '~/root'

import type { CircularGroupingMetadata, FilteredMetadata } from '../circulars/circulars.lib'
import Search from './Search'
import Pagination from './Pagination'
import GroupedView from './GroupedView'
import IndexView from './IndexView'

export async function loader({ request }: DataFunctionArgs) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const currentPage = parseInt(searchParams.get('page') || '1')
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)

  const searchResponse = await search({
    query,
    page: currentPage - 1,
    limit,
    startDate,
    endDate,
  })
  const { synonyms, totalItems, totalPages } = await getUniqueSynonymsArrays({
    page: currentPage,
    eventId: query,
    limit,
  })
  const checkedSynonyms = synonyms || undefined
  const { results } = await getCircularsGroupedBySynonyms({
    synonyms: checkedSynonyms,
  })
  const combinedResults: FilteredMetadata = {
    groups: {
      page: currentPage,
      items: results.groups,
      totalPages: totalPages || 0,
      totalItems: totalItems || 0,
    },
    index: {
      page: currentPage,
      items: searchResponse.items,
      totalPages: searchResponse.totalPages,
      totalItems: searchResponse.totalItems,
    },
  }
  return { ...combinedResults }
}

function IndexHeader() {
  return (
    <>
      <h1>GCN Circulars</h1>
      <p className="usa-paragraph">
        <b>
          GCN Circulars are rapid astronomical bulletins submitted by and
          distributed to community members worldwide.
        </b>{' '}
        They are used to share discoveries, observations, quantitative near-term
        predictions, requests for follow-up observations, or future observing
        plans related to high-energy, multi-messenger, and variable or transient
        astrophysical events. See the{' '}
        <Link to="/docs/circulars">documentation</Link> for help with
        subscribing to or submitting Circulars.
      </p>
    </>
  )
}

export default function () {
  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') || '100'
  const query = searchParams.get('query') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`
  const { groups, index } = useLoaderData<typeof loader>()
  const newItem = useActionData<typeof action>()
  // const featureCircularsFilterByDate = useFeature('CIRCULARS_FILTER_BY_DATE')
  const featureSynonyms = useFeature('SYNONYM_GROUPING')
  // Concatenate items from the action and loader functions
  const allItems = [...(newItem ? [newItem] : []), ...(index.items || [])]
  const allGroups = (groups.items as CircularGroupingMetadata[]) || []

  const [groupsChecked, setGroupsChecked] = useState(false)
  const [circularsChecked, setCircularsChecked] = useState(true)
  const filteredPage = circularsChecked ? index.page : groups.page
  const filteredTotalPages = circularsChecked
    ? index.totalPages
    : groups.totalPages

    const filteredTotalItems = circularsChecked
    ? index.totalItems
    : groups.totalItems
  const [inputQuery, setInputQuery] = useState(query)
  const clean = inputQuery === query

  const submit = useSubmit()

  return (
    <>
      <h1>GCN Circulars</h1>
      <IndexHeader />
      <Search startDate={startDate} endDate={endDate} query={query} />
      { featureSynonyms && (
        <details className="margin-top-1 open">
          <summary className="">Advanced Search Filters</summary>
          <div className="margin-left-3">
            <fieldset className="usa-fieldset">
              <div className="usa-checkbox maxw-card-lg">
                <input
                  className="usa-checkbox__input usa-radio__input--tile"
                  id="circulars"
                  type="checkbox"
                  name="circulars"
                  value={circularsChecked.toString()}
                  checked={circularsChecked}
                  onClick={() => {
                    setCircularsChecked(!circularsChecked)
                    setGroupsChecked(!groupsChecked)
                  }}
                />
                <label className="usa-checkbox__label" htmlFor="circulars">
                  Circulars
                  <span className="usa-checkbox__label-description">
                    View Circulars index.
                  </span>
                </label>
              </div>
              <div className="usa-checkbox maxw-card-lg">
                <input
                  className="usa-checkbox__input usa-checkbox__input--tile"
                  id="groups"
                  type="checkbox"
                  name="groups"
                  value={groupsChecked.toString()}
                  checked={groupsChecked}
                  onChange={() => {
                    setCircularsChecked(!circularsChecked)
                    setGroupsChecked(!groupsChecked)
                  }}
                />
                <label className="usa-checkbox__label" htmlFor="groups">
                  Groups
                  <span className="usa-checkbox__label-description">
                    View Circulars grouped by synonymous events.
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </details>
      )}
      {clean && (
        <>
          {query && (
            <h3>
              {filteredTotalItems} result{filteredTotalItems != 1 && 's'} found.
            </h3>
          )}
          {/* index view or grouped view go here */}
          {featureSynonyms && groupsChecked && (
            <GroupedView allItems={allGroups} searchString={''} totalItems={0} />
          )}
          {
            circularsChecked && (
              <IndexView allItems={allItems} searchString={''} />
            )
          }

          <div className="display-flex flex-row flex-wrap">
            <div className="display-flex flex-align-self-center margin-right-2 width-auto">
              <div>
                <Select
                  id="limit"
                  className="width-auto height-5 padding-y-0 margin-y-0"
                  name="limit"
                  defaultValue="100"
                  form="searchForm"
                  onChange={({ target: { form } }) => {
                    submit(form)
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </Select>
              </div>
            </div>
            <div className="display-flex flex-fill">
              {filteredTotalPages > 1 && (
                <Pagination
                  query={query}
                  page={filteredPage}
                  limit={parseInt(limit)}
                  totalPages={filteredTotalPages}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

