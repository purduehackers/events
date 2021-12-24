import Link, { LinkProps } from 'next/link'

type StyledLinkProps = {
  destination: LinkProps['href']
  color?: string
  newTab?: boolean
  children?: any
}

const StyledLink = ({
  destination,
  color = 'text-amber-500 hover:text-amber-400',
  newTab = false,
  ...props
}: StyledLinkProps) => (
  <span>
    <Link href={destination} passHref>
      <a
        href="#"
        target={newTab ? '_blank' : ''}
        className={`${color} transition`}
      >
        {props.children}
      </a>
    </Link>
  </span>
)

export default StyledLink
