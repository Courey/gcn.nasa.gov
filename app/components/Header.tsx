/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link, NavLink } from '@remix-run/react'
import {
  Menu,
  NavMenuButton,
  PrimaryNav,
  Title,
  Header as USWDSHeader,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { useEmail, useUserIdp } from '~/root'

import logo from '~/img/logo.svg'

/**
 * A variation on the NavDropDownButton component from @trussworks/react-uswds
 * that acts as a simple hyperlink if JavaScript is disabled or if the page
 * has not yet been hydrated.
 *
 * Adapted from https://github.com/trussworks/react-uswds/blob/main/src/components/header/NavDropDownButton/NavDropDownButton.tsx.
 */
function NavDropDownButton({
  label,
  menuId,
  isOpen,
  onToggle,
  isCurrent,
  className,
  ...props
}: {
  label: string
  menuId: string
  isOpen: boolean
  onToggle: () => void
  isCurrent?: boolean
} & Parameters<typeof NavLink>[0]) {
  return (
    <NavLink
      className={`usa-nav__link ${className}`}
      style={{ padding: 0 }}
      {...props}
    >
      <button
        type="button"
        className="usa-accordion__button"
        data-testid="navDropDownButton"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(e) => {
          onToggle()
          e.preventDefault()
        }}
      >
        <span>{label}</span>
      </button>
    </NavLink>
  )
}

export function Header() {
  const email = useEmail()
  const idp = useUserIdp()
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)

  function toggleMobileNav() {
    setExpanded((expanded) => !expanded)
  }

  function hideMobileNav() {
    setExpanded(false)
  }

  function onClickUserMenuItem() {
    if (userMenuIsOpen && !expanded) setUserMenuIsOpen(false)
    hideMobileNav()
  }

  return (
    <>
      {expanded && (
        <div className="usa-overlay is-visible" onClick={hideMobileNav} />
      )}
      <USWDSHeader basic className="usa-header usa-header--dark">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/">
                <img id="site-logo" src={logo} alt="NASA logo" />
                <span id="site-title">General Coordinates Network</span>
              </Link>
            </Title>
            <NavMenuButton onClick={toggleMobileNav} label="Menu" />
          </div>
          <PrimaryNav
            mobileExpanded={expanded}
            items={[
              <NavLink
                className="usa-nav__link"
                to="/missions"
                key="/missions"
                onClick={hideMobileNav}
              >
                Missions
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/notices"
                key="/notices"
                onClick={hideMobileNav}
              >
                Notices
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/circulars"
                key="/circulars"
                onClick={hideMobileNav}
              >
                Circulars
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/docs"
                key="/docs"
                onClick={hideMobileNav}
              >
                Documentation
              </NavLink>,
              email ? (
                <>
                  <NavDropDownButton
                    to="/user"
                    type="button"
                    key="user"
                    label={email}
                    isOpen={userMenuIsOpen}
                    onToggle={() => {
                      setUserMenuIsOpen(!userMenuIsOpen)
                    }}
                    menuId="user"
                  />
                  <Menu
                    id="user"
                    isOpen={userMenuIsOpen}
                    items={[
                      <Link key="user" to="/user" onClick={onClickUserMenuItem}>
                        Profile
                      </Link>,
                      <Link
                        key="endorsements"
                        to="/user/endorsements"
                        onClick={onClickUserMenuItem}
                      >
                        Peer Endorsements
                      </Link>,
                      idp === 'Cognito' ? (
                        <Link
                          key="password"
                          to="/user/password"
                          onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                        >
                          Update Password
                        </Link>
                      ) : null,
                      <Link
                        key="credentials"
                        to="/user/credentials"
                        onClick={onClickUserMenuItem}
                      >
                        Client Credentials
                      </Link>,
                      <Link
                        key="email"
                        to="/user/email"
                        onClick={onClickUserMenuItem}
                      >
                        Email Notifications
                      </Link>,
                      <Link
                        key="logout"
                        to="/logout"
                        onClick={onClickUserMenuItem}
                      >
                        Sign Out
                      </Link>,
                    ]}
                  />
                </>
              ) : (
                <Link
                  className="usa-nav__link"
                  to="/login"
                  key="/login"
                  onClick={hideMobileNav}
                >
                  Sign in / Sign up
                </Link>
              ),
            ]}
            onToggleMobileNav={toggleMobileNav}
          />
        </div>
      </USWDSHeader>
    </>
  )
}
