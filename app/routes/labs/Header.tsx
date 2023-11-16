import { Link, NavLink } from '@remix-run/react'
import { Icon, PrimaryNav, Title } from '@trussworks/react-uswds'

export default function Header() {
  return (
    <>
      <div className="usa-header usa-header--light">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/labs">
                <Icon.TrendingUp id="site-logo" className="width-auto" />
                <span id="site-title">LAB</span>
              </Link>
            </Title>
          </div>
          <PrimaryNav
            items={[
              <NavLink
                className="usa-nav__link"
                to="/labs/projects"
                key="/projects"
              >
                Projects
              </NavLink>,
            ]}
          />
        </div>
      </div>
    </>
  )
}
