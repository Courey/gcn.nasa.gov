import { Link } from '@remix-run/react'
import type { Circular } from '../circulars/circulars.lib'

export default function({
  allItems,
  searchString
}:{
  allItems: Circular[]
  searchString: string
}){
  return (
    <>
      <ol>
        {allItems.map(({ circularId, subject }) => (
          <li key={circularId} value={circularId}>
            <Link
              className="usa-link"
              to={`/circulars/${circularId}${searchString}`}
            >
              {subject}
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}

