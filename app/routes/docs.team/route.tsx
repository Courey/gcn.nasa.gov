/*!
 * Copyright © 2025 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import {
  Button,
  CardBody,
  CardFooter,
  CardGroup,
  CardHeader,
  CardMedia,
  GridContainer,
  Icon,
  Tag,
} from '@trussworks/react-uswds'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import type {
  OptionRendererProps,
  Tag as ReactTag,
  TagRendererProps,
} from 'react-tag-autocomplete'

import type { BreadcrumbHandle } from '~/root/Title'

import headshot from './headshot.png'

export const handle: BreadcrumbHandle = { breadcrumb: 'Team' }

function TeamCard({
  children,
  name,
  affiliation,
  photo,
  href,
  tags,
  selectedTags,
}: {
  children: ReactNode
  name: string
  affiliation: string
  photo: string
  href: string
  tags: string[]
  selectedTags: string[]
}) {
  const tagSet = new Set(tags)
  return (
    <>
      {(selectedTags.length == 0 ||
        selectedTags.every((tag) => tagSet.has(tag))) && (
        <CardGroup className="usa-card__container margin-bottom-2 grid-col-4">
          <CardMedia imageClass="bg-white margin-0 padding-0">
            <img
              src={photo}
              width="40"
              height="40"
              loading="lazy"
              alt="placeholder"
            />
          </CardMedia>
          <CardHeader>
            <h4 style={{ marginBottom: '0px' }}>
              <a className="usa-link" href={href}>
                <>{name}</>
              </a>
            </h4>
            <p style={{ marginTop: '0px', fontSize: '12px' }}>{affiliation}</p>
          </CardHeader>
          <CardBody style={{ fontSize: '16px' }}>{children}</CardBody>
          <CardFooter>
            {tags?.map((tag) => (
              <Tag key={tag} className="font-body-3xs">
                {tag}
              </Tag>
            ))}
          </CardFooter>
        </CardGroup>
      )}
    </>
  )
}

function renderTag({
  classNames,
  tag: { label },
  ...tagProps
}: TagRendererProps) {
  return (
    <Tag className={classNames.tag} {...tagProps}>
      <span className={classNames.tagName}>
        {label}{' '}
        <Button type="button" unstyled>
          <Icon.Close
            role="presentation"
            className="margin-left-1 text-bottom"
            color="white"
          />
        </Button>
      </span>
    </Tag>
  )
}

function renderOption({
  children,
  classNames,
  option,
  ...optionProps
}: OptionRendererProps) {
  const classes = [classNames.option]

  if (option.active) classes.push(classNames.optionIsActive)

  return (
    <div className={classes.join(' ')} {...optionProps}>
      {option.disabled ? children : <Tag>{children}</Tag>}
    </div>
  )
}

export default function () {
  const [tags, setTags] = useState<ReactTag[]>([])
  const suggestions = ['moderator', 'classic', 'kafka']
  const tagNames = tags.map(({ label }) => label)
  return (
    <GridContainer className="usa-section">
      <h1>GCN Team</h1>
      <p className="usa-paragraph">
        The current and past contributors to GCN. For questions, please contact
        us via the{' '}
        <Link className="usa-link" to="/contact">
          GCN Helpdesk
        </Link>{' '}
        .
      </p>
      <div className="margin-bottom-2">
        <ReactTags
          onAdd={(tag) => setTags((prevTags) => [...prevTags, tag])}
          onDelete={(i) =>
            setTags((prevTags) => {
              const newTags = prevTags.slice(0)
              newTags.splice(i, 1)
              return newTags
            })
          }
          delimiterKeys={[' ', ',', 'Enter', 'Tab']}
          collapseOnSelect
          suggestions={suggestions.map((label) => ({ label, value: label }))}
          selected={tags}
          renderTag={renderTag}
          renderOption={renderOption}
          placeholderText="Filter by tag"
        />
      </div>
      <CardGroup>
        <TeamCard
          name="Judy Racusin"
          affiliation="NASA/GSFC"
          photo={headshot}
          href="https://github.com/jracusin"
          tags={['moderator']}
          selectedTags={tagNames}
        >
          Principal Investigator
        </TeamCard>
        <TeamCard
          name="Leo Singer"
          affiliation="NASA/GSFC"
          photo={headshot}
          href="https://github.com/lpsinger"
          tags={['moderator', 'kafka']}
          selectedTags={tagNames}
        >
          Lead Developer
        </TeamCard>
        <TeamCard
          name="Dakota Dutko"
          affiliation="NASA/GSFC/ADNET"
          photo={headshot}
          href="https://github.com/dakota002"
          tags={['moderator', 'kafka']}
          selectedTags={tagNames}
        >
          Full-Stack Developer
        </TeamCard>
        <TeamCard
          name="Courey Elliott"
          affiliation="LSU/NextSource"
          photo={headshot}
          href="https://github.com/courey"
          tags={['kafka']}
          selectedTags={tagNames}
        >
          Full-Stack Developer
        </TeamCard>
        <TeamCard
          name="Vidushi Sharma"
          affiliation="NASA/GSFC/UMBC"
          photo={headshot}
          href="https://github.com/vidushi-github"
          tags={['moderator']}
          selectedTags={tagNames}
        >
          Postdoc
        </TeamCard>
        <TeamCard
          name="Tyler Barna"
          affiliation="UMN"
          photo={headshot}
          href="https://github.com/tylerbarna"
          tags={['']}
          selectedTags={tagNames}
        >
          Ph.D. Student
        </TeamCard>
      </CardGroup>
    </GridContainer>
  )
}
