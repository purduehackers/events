import {
  SiDiscord as Discord,
  SiGithub as Github,
  SiInstagram as Instagram,
} from '@icons-pack/react-simple-icons'
import { Home } from 'react-feather'

import StyledLink from './styled-link'

const FooterLinks = () => (
  <div className="flex flex-row justify-center gap-x-5">
    <StyledLink destination="https://purduehackers.com" newTab>
      <Home />
    </StyledLink>
    <StyledLink destination="https://github.com/purduehackers" newTab>
      <Github />
    </StyledLink>
    <StyledLink destination="https://instagram.com/purduehackers" newTab>
      <Instagram />
    </StyledLink>
    <StyledLink destination="https://puhack.horse/discord" newTab>
      <Discord />
    </StyledLink>
  </div>
)

export default FooterLinks
