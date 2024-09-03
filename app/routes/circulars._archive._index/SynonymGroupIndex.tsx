import { useState } from 'react'
import type { SynonymGroupWithMembers } from '../synonyms/synonyms.lib'
import { Button, Grid, GridContainer, Icon, Link } from '@trussworks/react-uswds'

export default function ({
  allItems,
  searchString,
  totalItems,
  query,
}: {
  allItems: SynonymGroupWithMembers[]
  searchString: string
  totalItems: number
  query?: string
}) {
  const [groupOpened, setGroupOpened] = useState([] as string[])
  const [circularsOpened, setCircularsOpened] = useState([] as number[])
  const [expandAll, setExpandAll] = useState(false)
  function expandAllText(currentGroup: number[]) {
    return circularsOpened.some(r => currentGroup.includes(r))
  }

  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}

      <div className="usa-accordion usa-accordion--multiselectable usa-accordion--bordered margin-y-1" data-allow-multiple>
        {allItems.map(({ group, members }) => (
          <div key={group.synonymId}>
            <div className='bg-base-lightest hover:bg-base-lighter height-auto margin-top-1'>
                <GridContainer>
                  <Grid row className='padding-y-2'>
                    <Grid col={11} className='grid-col'>{group.eventIds.join(', ')}</Grid>
                    <Grid col={1}>
                      <div className=''>{`(${members.length.toString()})`}
                      <Button type='button' className='usa-button--unstyled float-right display-inline text-base-darkest'
                        onClick={() => {
                          if (groupOpened.includes(group.synonymId)) {
                            setGroupOpened(groupOpened.filter((id) => { return id != group.synonymId }))
                          } else {
                            setGroupOpened([...groupOpened, group.synonymId])
                          }
                        }}>
                        {groupOpened.includes(group.synonymId) ? <Icon.ExpandLess /> : <Icon.ExpandMore />}
                      </Button>
                      </div>
                    </Grid>
                  </Grid>
                </GridContainer>
              <div id={group.synonymId} hidden={!groupOpened.includes(group.synonymId)} className="usa-accordion__content usa-prose">
                <div className="bordered">
                  <Button type='button' outline onClick={() => {
                    const allCircularIds = members.map((circular) => circular.circularId)
                    const filteredIds = expandAll ? circularsOpened.filter((x) => { return !allCircularIds.includes(x) }) : [... new Set([...circularsOpened, ...allCircularIds])]
                    setCircularsOpened(filteredIds)
                    setExpandAll(!expandAll)
                  }}>
                    {`${(expandAllText(members.map((circular) => circular.circularId))) ? 'Minimize' : 'Expand'} All`}
                  </Button>
                </div>
                {members.map((circular) => {
                  return (
                    <div key={circular.circularId}>
                      <h4 className="usa-accordion__heading">
                        <button
                          type="button"
                          className="usa-accordion__button"
                          aria-expanded={circularsOpened.includes(circular.circularId)}
                          aria-controls={circular.circularId.toString()}
                          onClick={() => {
                            if (circularsOpened.includes(circular.circularId)) {
                              setCircularsOpened(circularsOpened.filter((id) => { return id != circular.circularId }))
                            } else {
                              setCircularsOpened([...circularsOpened, circular.circularId])
                            }
                          }}
                        >
                          <Link href={`circulars/${circular.circularId}`}>
                            {circular.subject}
                          </Link>
                        </button>
                      </h4>
                      <div id={circular.circularId.toString()} hidden={!circularsOpened.includes(circular.circularId)} className="usa-accordion__content usa-prose">
                        <div className='usa-collection__meta-item'>
                          <span className='text-bold'>Date: </span>{new Date(circular.createdOn).toISOString()}
                        </div>
                        <div className='usa-collection__meta-item'>
                          <span className='text-bold'>From: </span>
                          {circular.submitter}
                        </div>
                        <div className='usa-collection__meta-item'>
                          <span className='text-bold'>Via: </span>
                          {circular.submittedHow}
                        </div>
                        <div className='usa-collection__item'>
                          {circular.body}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
