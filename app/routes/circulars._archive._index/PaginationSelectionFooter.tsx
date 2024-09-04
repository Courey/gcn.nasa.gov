import { useSubmit } from '@remix-run/react'
import { Select } from '@trussworks/react-uswds'

import CircularPagination from './CircularPagination'

export default function ({
  page,
  totalPages,
  limit,
  query,
  formId,
  view,
}: {
  page: number
  totalPages: number
  limit?: number
  query?: string
  formId: string
  view?: string
}) {
  console.log('PAGINATION SELECTION FOOTER START ************>')
  const submit = useSubmit()
  const isGroupView = view === 'group'
  const defaultNumberSelection = isGroupView ? '20' : '100'
  console.log(`VIEW: ${view}`)
  console.log(`DEFAULT SELECTION: ${defaultNumberSelection}`)
  console.log('PAGINATION SELECTION FOOTER END <************')
  return (
    <div className="display-flex flex-row flex-wrap">
      <div className="display-flex flex-align-self-center margin-right-2 width-auto">
        <div>
          <input
            type="hidden"
            form={formId}
            name="view"
            id="view"
            value={view}
          ></input>
          <Select
            id="limit"
            title="Number of results per page"
            className="width-auto height-5 padding-y-0 margin-y-0"
            name="limit"
            defaultValue={defaultNumberSelection}
            form={formId}
            onChange={({ target: { form } }) => {
              submit(form)
            }}
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            {!isGroupView && (
              <>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </>
            )}
          </Select>
        </div>
      </div>
      <div className="display-flex flex-fill">
        {totalPages > 1 && (
          <CircularPagination
            query={query}
            page={page}
            limit={limit}
            totalPages={totalPages}
            view={view}
          />
        )}
      </div>
    </div>
  )
}
