import StyledLink from "./styled-link"

const Footer = () => (
  <footer className="bg-gray-100 flex flex-col justify-center items-center text-center bottom-0 m-0 absolute w-full py-8">
    <p>Made with 💛 by the{' '}<StyledLink destination="https://purduehackers.com">Purdue Hackers</StyledLink> executive team.</p>
  </footer>
)

export default Footer