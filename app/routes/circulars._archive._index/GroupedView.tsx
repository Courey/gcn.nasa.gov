import { useState } from 'react'
import type { CircularGroupingMetadata } from '../circulars/circulars.lib'
import { Link } from '@remix-run/react'

export default function({
  allItems,
  searchString,
  totalItems,
}: {
  allItems: CircularGroupingMetadata[]
  searchString: string
  totalItems: number
}) {
  if (searchString) searchString = `?${searchString}`
  const [detailsToggle, setDetailsToggle] = useState(false)
  const expandAllText = detailsToggle ? 'Close All' : 'Open All'
  return (
    <>
      <div>
        <details
          className="margin-bottom-2 margin-top-1"
          aria-label="view all toggle"
          onClick={() => {
            setDetailsToggle(!detailsToggle)
          }}
        >
          <summary className="text-base border-base-lighter">
            {expandAllText}
          </summary>
        </details>

        {totalItems > 0 &&
          allItems.map(({ circulars }) => (
            <>
              <details open={detailsToggle}>
                <summary>{circulars[0].synonyms?.join(', ')}</summary>
                <ol className="">
                  {circulars.map(({ circularId, subject }) => (
                    <li
                      id={circularId.toString()}
                      value={circularId}
                      key={circularId.toString()}
                      className="border-base-lighter"
                    >
                      <Link className="" to={`/circulars/${circularId}`}>
                        {subject}
                      </Link>
                    </li>
                  ))}
                </ol>
              </details>
            </>
          ))}
      </div>
    </>
  )
}

