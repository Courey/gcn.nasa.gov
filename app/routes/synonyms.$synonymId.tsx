/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Alert,
  Button,
  ButtonGroup,
  FormGroup,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef, useState } from 'react'
import invariant from 'tiny-invariant'

import {
  deleteSynonyms,
  getSynonymsByUuid,
  putSynonyms,
} from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { getFormDataString } from '~/lib/utils'

export async function loader({ params: { synonymId } }: LoaderFunctionArgs) {
  invariant(synonymId)
  const synonyms = await getSynonymsByUuid(synonymId)
  const eventIds = synonyms.map((synonym) => synonym.eventId)

  return {
    eventIds,
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
    const additions =
      getFormDataString(data, 'addSynonyms')?.split(',') || ([] as string[])
    const filtered_additions = additions.filter((add) => add)
    const subtractions =
      getFormDataString(data, 'deleteSynonyms')?.split(',') || ([] as string[])
    const filtered_subtractions = subtractions.filter((sub) => sub)
    const response = await putSynonyms({
      synonymId,
      additions: filtered_additions,
      subtractions: filtered_subtractions,
    })
    return response?.error
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
  const error = useActionData<typeof action>()
  const { eventIds } = useLoaderData<typeof loader>()
  const [deleteSynonyms, setDeleteSynonyms] = useState([] as string[])
  const [synonyms, setSynonyms] = useState(eventIds || [])
  const [addSynonyms, setAddSynonyms] = useState([] as string[])
  const [newSynonym, setNewSynonym] = useState('')
  const modalRef = useRef<ModalRef>(null)

  return (
    <>
      <ToolbarButtonGroup className="flex-wrap">
        <Link to="/synonyms" className="usa-button flex-align-stretch">
          <div className="position-relative">
            <Icon.ArrowBack
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
        <ModalToggleButton modalRef={modalRef} opener type="button">
          <Icon.Delete
            role="presentation"
            className="bottom-aligned margin-right-05"
          />{' '}
          Delete
        </ModalToggleButton>
      </ToolbarButtonGroup>
      <h1>Synonym Group</h1>
      {error && (
        <Alert type="error" heading="Error:" headingLevel="h4">
          {error}
        </Alert>
      )}
      <p>
        If you are adding an event identifier that is already part of a group,
        it will be removed from the previous association and added to this
        group.
      </p>
      <ToolbarButtonGroup className="bg-white z-300">
        <Form>
          <ToolbarButtonGroup className="height-auto">
            <input
              placeholder="event id"
              className="margin-right-1 height-full"
              value={newSynonym}
              key="synonym"
              id="synonymInput"
              name="synonym"
              type="text"
              onChange={(e) => {
                setNewSynonym(e.currentTarget.value)
              }}
            />
            <Button
              type="button"
              onClick={() => {
                if (!newSynonym) return
                setDeleteSynonyms(
                  deleteSynonyms.filter(function (item) {
                    return item !== newSynonym
                  })
                )
                const existingSynonyms = [...synonyms, newSynonym].filter(
                  function (v, i, self) {
                    return i == self.indexOf(v)
                  }
                )
                setSynonyms(existingSynonyms)
                const additionalSynonyms = [...addSynonyms, newSynonym].filter(
                  function (v, i, self) {
                    return i == self.indexOf(v)
                  }
                )
                setAddSynonyms(additionalSynonyms)
                setNewSynonym('')
              }}
            >
              <Icon.Add role="presentation" /> Add
            </Button>
          </ToolbarButtonGroup>
        </Form>
      </ToolbarButtonGroup>
      <Form
        method="POST"
        onSubmit={() => {
          setAddSynonyms([])
          setDeleteSynonyms([])
        }}
      >
        <input type="hidden" name="intent" value="edit" />
        <FormGroup>
          <input type="hidden" name="deleteSynonyms" value={deleteSynonyms} />
          <input type="hidden" name="addSynonyms" value={addSynonyms} />
          <ul className="usa-list usa-list--unstyled">
            {synonyms?.map((synonym) => (
              <li key={synonym}>
                <ButtonGroup>
                  {synonym}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setDeleteSynonyms((oldArray) => [...oldArray, synonym])
                      setSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                      setAddSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                    }}
                  >
                    Remove
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            disabled={!addSynonyms.length && !deleteSynonyms.length}
          >
            Save
          </Button>
        </FormGroup>
      </Form>
      <Modal
        ref={modalRef}
        id="example-modal-1"
        aria-labelledby="modal-1-heading"
        aria-describedby="modal-1-description"
        renderToPortal={false}
      >
        <ModalHeading id="modal-1-heading">
          Are you sure you want to continue?
        </ModalHeading>
        <div className="usa-prose">
          <p id="modal-1-description">
            You are about to permanently delete this Synonym Group.
          </p>
        </div>
        <ModalFooter>
          <ButtonGroup>
            <Form method="POST">
              <input type="hidden" name="intent" value="delete" />
              <Button type="submit" outline>
                <Icon.Delete
                  role="presentation"
                  className="bottom-aligned margin-right-05"
                />{' '}
                Delete
              </Button>
            </Form>
            <ModalToggleButton
              modalRef={modalRef}
              closer
              unstyled
              className="padding-105 text-center"
            >
              Go back
            </ModalToggleButton>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  )
}
