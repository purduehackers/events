import { Home } from 'react-feather'
import { Instagram, Discord, Github } from '@icons-pack/react-simple-icons'
import StyledLink from './styled-link'

const FooterLinks = () => (
  <div className="flex flex-row justify-center gap-x-5">
    <StyledLink destination="https://purduehackers.com" newTab>
      <Home />
    </StyledLink>
    <StyledLink
      destination="https://github.com/MatthewStanciu/purduehackers-events"
      newTab
    >
      <Github />
    </StyledLink>
    <StyledLink destination="https://instagram.com/purduehackers" newTab>
      <Instagram />
    </StyledLink>
    <StyledLink destination="https://bit.ly/PurdueHackersDiscord" newTab>
      <Discord />
    </StyledLink>
  </div>
)

export default FooterLinks
