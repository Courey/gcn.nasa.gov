/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'
import { FrontMatter } from 'app/components//FrontMatter'
import { PlainTextBody } from 'app/components/Body'

import type { SynonymGroup } from './synonyms/synonyms.lib'
import {
  getAllSynonymMembers,
  getSynonymById,
} from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'

export async function loader({
  params: { synonymId },
  request: { url },
}: LoaderFunctionArgs) {
  if (!synonymId) throw new Response('Id is required', { status: 400 })

  const { searchParams } = new URL(url)
  const view = searchParams.get('view') || 'group'
  const limit = searchParams.get('limit') || 20
  const page = searchParams.get('page') || 1
  const synonym = (await getSynonymById(synonymId)) as SynonymGroup
  const members = await getAllSynonymMembers(synonym.eventIds)

  return { members, eventIds: synonym.eventIds, view, limit, page }
}

export default function Group() {
  const { members, eventIds, view, limit, page } =
    useLoaderData<typeof loader>()
  const searchString = `?view=${view}&limit=${limit}&page=${page}`

  return (
    <>
      <ToolbarButtonGroup className="flex-wrap">
        <Link
          to={`/circulars${searchString}`}
          className="usa-button flex-align-stretch"
        >
          <div className="position-relative">
            <Icon.ArrowBack
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
      </ToolbarButtonGroup>
      <h1>{`Group ${eventIds.join(', ')}`}</h1>
      {members.map((circular) => (
        <div key={circular.circularId}>
          <details>
            <summary>
              <Link to={`/circulars/${circular.circularId}`}>
                {circular.subject}
              </Link>
            </summary>
            <div>
              <div className="margin-2">
                <FrontMatter
                  createdOn={circular.createdOn}
                  submitter={circular.submitter}
                  subject={circular.subject}
                  submittedHow={circular.submittedHow}
                  editedBy={circular.editedBy}
                  editedOn={circular.editedOn}
                />
              </div>
              <PlainTextBody className="margin-2" children={circular.body} />
            </div>
          </details>
        </div>
      ))}
    </>
  )
}
