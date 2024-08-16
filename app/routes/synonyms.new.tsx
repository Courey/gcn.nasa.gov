import type { ActionFunctionArgs } from '@remix-run/node'
import { Form, redirect, useActionData } from '@remix-run/react'
import {
  Alert,
  Button,
  ButtonGroup,
  FormGroup,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useId, useState } from 'react'

import { createSynonyms } from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const eventIds = getFormDataString(data, 'synonyms')?.split(',')
  if (!eventIds) return 'Must include at least 1 eventId.'
  const { synonymId, success, error } = await createSynonyms(eventIds)

  if (success) {
    return redirect(`/synonyms/${synonymId}`)
  } else {
    return error
  }
}

export default function () {
  const error = useActionData<typeof action>()
  const formId = useId()
  const [synonyms, setSynonyms] = useState([] as string[])
  const [input, setInput] = useState('')

  return (
    <>
      <h1>Create New Synonym Group</h1>
      {error && (
        <Alert type="error" heading="Error:" headingLevel="h4">
          {error}
        </Alert>
      )}
      <ToolbarButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1 z-300">
        <Form preventScrollReset className="" id={formId}>
          <ButtonGroup>
            <Label srOnly htmlFor="query">
              Find by eventId
            </Label>
            <TextInput
              autoFocus
              className="margin-bottom-1"
              id="eventId"
              name="eventId"
              type="text"
              value={input}
              placeholder="eventId"
              aria-describedby="eventId"
              onChange={({ target: { value } }) => {
                setInput(value)
              }}
            />
            <Button
              type="button"
              onClick={() => {
                setSynonyms([...synonyms, input])
                setInput('')
              }}
            >
              <Icon.Add /> Add
            </Button>
          </ButtonGroup>
        </Form>
      </ToolbarButtonGroup>
      <Form method="POST">
        <FormGroup className="margin-left-1">
          <input type="hidden" name="synonyms" value={synonyms} />
          <ul className="usa-list usa-list--unstyled">
            {synonyms?.map((synonym) => (
              <li key={synonym}>
                <ButtonGroup>
                  {synonym}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setSynonyms(
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
          <Button type="submit" disabled={!(synonyms.length > 1)}>
            Create
          </Button>
        </FormGroup>
      </Form>
    </>
  )
}
