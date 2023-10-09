import { Button, ButtonGroup, Form, Icon, Label, Link, TextInput } from '@trussworks/react-uswds'
import DateSelectorButton from './DateSelectorButton'
import Hint from '~/components/Hint'
import { useSubmit } from '@remix-run/react'
import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'
import { feature } from '~/lib/env.server'
import { useState } from 'react'

export default function ({
  startDate,
  endDate,
  query
}: {
  startDate?: string
  endDate?: string
  query?: string
}) {
  const submit = useSubmit()
  const [inputQuery, setInputQuery] = useState(query)
  const featureCircularsFilterByDate = feature('CIRCULARS_FILTER_BY_DATE')
  return (
    <>
      <ButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
        <Form
          className="display-inline-block usa-search usa-search--small"
          role="search"
          id="searchForm"
        >
          <Label srOnly={true} htmlFor="query">
            Search
          </Label>
          <TextInput
            autoFocus
            id="query"
            name="query"
            type="search"
            defaultValue={inputQuery}
            placeholder="Search"
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInputQuery(value)
              if (!value) submit(form)
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
        {featureCircularsFilterByDate && (
          <DateSelectorButton startDate={startDate} endDate={endDate} />
        )}
        <Link to={`/circulars/new${searchString}`}>
          <Button
            type="button"
            className="height-4 padding-top-0 padding-bottom-0"
          >
            <Icon.Edit role="presentation" /> New
          </Button>
        </Link>
      </ButtonGroup>
      <Hint id="searchHint">
        Search for Circulars by submitter, subject, or body text (e.g. 'Fermi
        GRB'). <br />
        To navigate to a specific circular, enter the associated Circular ID
        (e.g. 'gcn123', 'Circular 123', or '123').
      </Hint>
    </>
  )
}