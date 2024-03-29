/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, FormGroup, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'
import invariant from 'tiny-invariant'

import {
  deleteSynonyms,
  getSynonym,
  putSynonyms,
} from './synonyms/synonyms.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ params: { synonymId } }: LoaderFunctionArgs) {
  invariant(synonymId)
  const synonym = await getSynonym(synonymId)
  return {
    synonym,
  }
}

export async function action({
  request,
  params: { synonymId },
}: ActionFunctionArgs) {
  invariant(synonymId)
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')

  if (intent === 'edit') {
    const synonyms =
      getFormDataString(data, 'synonyms')?.split(',') || ([] as string[])
    await putSynonyms({
      synonymId,
      synonyms,
    })
    return null
  } else if (intent === 'delete') {
    await deleteSynonyms(synonymId)
    return redirect('/synonyms')
  } else {
    throw new Response('Unknown intent.', {
      status: 400,
    })
  }
}

export default function () {
  const { synonym } = useLoaderData<typeof loader>()
  if (!synonym) throw new Response(null, { status: 404 })
  const initialEventIds = synonym.eventId
  const [synonyms, setSynonyms] = useState(initialEventIds || [])
  const [newSynonym, setNewSynonym] = useState('')

  return (
    <>
      <ButtonGroup>
        <h1>Synonym Group</h1>
        <ButtonGroup className="margin-bottom-2">
          <Link to="/synonyms" className="usa-button">
            <div className="display-inline">
              <Icon.ArrowBack
                role="presentation"
                className="position-relative"
              />
            </div>
          </Link>
          <Form method="POST">
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit">
              <Icon.Delete
                role="presentation"
                className="bottom-aligned margin-right-05"
              />
            </Button>
          </Form>
        </ButtonGroup>
      </ButtonGroup>
      <Form>
        <FormGroup>
          <ButtonGroup>
            <input
              placeholder="event id"
              key="synonyms"
              onChange={(e) => {
                setNewSynonym(e.currentTarget.value)
              }}
            />
            <Button
              type="button"
              onClick={(e) => {
                const existingSynonyms = [...synonyms, newSynonym].filter(
                  function (v, i, self) {
                    return i == self.indexOf(v)
                  }
                )
                setSynonyms(existingSynonyms)
              }}
            >
              <Icon.Add role="presentation" /> Add
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Form>
      <Form method="POST">
        <input type="hidden" name="intent" value="edit" />
        <FormGroup>
          <input type="hidden" name="synonyms" value={synonyms} />
          <ul className="usa-list usa-list--unstyled">
            {synonyms.map((syn) => (
              <li key={syn}>
                <ButtonGroup>
                  {syn}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setSynonyms(
                        synonyms.filter(function (item) {
                          return item !== syn
                        })
                      )
                    }}
                  >
                    <Icon.Delete aria-label="Delete" />
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        </FormGroup>
        <FormGroup>
          <Button type="submit" disabled={synonyms === initialEventIds}>
            Save
          </Button>
        </FormGroup>
      </Form>
    </>
  )
}
