import { GitHub, Home, Instagram } from 'react-feather'
import StyledLink from "./styled-link"

const FooterLinks = () => (
  <div className="flex flex-row justify-center gap-x-5">
    <StyledLink destination="https://purduehackers.com" newTab>
      <Home />
    </StyledLink>
    <StyledLink destination="https://github.com/MatthewStanciu/purduehackers-events" newTab>
      <GitHub />
    </StyledLink>
    <StyledLink destination="https://instagram.com/purduehackers" newTab>
      <Instagram />
    </StyledLink>
  </div>
)

export default FooterLinks