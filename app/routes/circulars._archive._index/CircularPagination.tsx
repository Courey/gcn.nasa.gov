/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'
import classNames from 'classnames'

import { usePagination } from '~/lib/pagination'

function getPageLink({
  page,
  limit,
  query,
  startDate,
  endDate,
  view
}: {
  page: number
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
  view?: string
}) {
  const searchParams = new URLSearchParams()
  if (page > 1) searchParams.set('page', page.toString())
  if (limit && limit != 100) searchParams.set('limit', limit.toString())
  if (query) searchParams.set('query', query)
  if (startDate) searchParams.set('startDate', startDate)
  if (endDate) searchParams.set('endDate', endDate)
  console.log(`CIRCULAR PAGINATION getPageLink VIEW: ${view}`)
  searchParams.set('view', view || 'index')

  const searchString = searchParams.toString()
  // console.log(`VIEW THING: ${searchString}`)
  return searchString && `?${searchString}`
}

export default function ({
  page,
  totalPages,
  view,
  ...queryStringProps
}: {
  page: number
  totalPages: number
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
  view?: string
}) {
  console.log(`CIRCULAR PAGINATION CURRENT PAGE: ${page}`)
  console.log(`CIRCULAR PAGINATION TOTAL PAGES: ${totalPages}`)
  const pages = usePagination({ currentPage: page, totalPages })
  return (
    <nav aria-label="Pagination" className="usa-pagination">
      <ul className="usa-pagination__list">
        {pages.map((pageProps, i) => {
          switch (pageProps.type) {
            case 'prev':
              if (totalPages >= page) {
                console.log(`CIRCULAR PAGINATION PAGE PROPS NUMBER: ${JSON.stringify(pageProps)}`)
                return (
                  <li
                    className="usa-pagination__item usa-pagination__arrow"
                    key={i}
                  >
                    <Link
                      to={getPageLink({
                        page: pageProps.number,
                        view,
                        ...queryStringProps,
                      })}
                      className="usa-pagination__link usa-pagination__previous-page"
                      aria-label="Previous page"
                    >
                      <Icon.NavigateBefore role="presentation" />
                      <span className="usa-pagination__link-text">
                        Previous
                      </span>
                    </Link>
                  </li>
                )
              } else {
                return null
              }
            case 'overflow':
              if (totalPages >= page) {
                return (
                  <li
                    className="usa-pagination__item usa-pagination__overflow"
                    role="presentation"
                    key={i}
                  >
                    <span>…</span>
                  </li>
                )
              } else {
                return null
              }
            case 'next':
              if (totalPages > page) {
                console.log(`CIRCULAR PAGINATION PAGE PROPS NEXT NUMBER: ${pageProps}`)
                return (
                  <li
                    className="usa-pagination__item usa-pagination__arrow"
                    key={i}
                  >
                    <Link
                      to={getPageLink({
                        page: pageProps.number,
                        view,
                        ...queryStringProps,
                      })}
                      className="usa-pagination__link usa-pagination__next-page"
                      aria-label="Next page"
                    >
                      <Icon.NavigateNext role="presentation" />
                      <span className="usa-pagination__link-text">Next</span>
                    </Link>
                  </li>
                )
              } else {
                return null
              }
            default:
              return (
                <li
                  className="usa-pagination__item usa-pagination__page-no"
                  key={i}
                >
                  <Link
                    to={getPageLink({
                      page: pageProps.number,
                      view,
                      ...queryStringProps,
                    })}
                    className={classNames('usa-pagination__button', {
                      'usa-current': pageProps.isCurrent,
                    })}
                    prefetch="render"
                    aria-label={`Page ${pageProps.number}`}
                    aria-current={pageProps.isCurrent}
                  >
                    {pageProps.number}
                  </Link>
                </li>
              )
          }
        })}
      </ul>
    </nav>
  )
}
