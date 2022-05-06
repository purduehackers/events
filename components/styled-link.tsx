type StyledLinkProps = {
  destination: string
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
    <a
      href={destination}
      target={newTab ? '_blank' : ''}
      className={`${color} transition`}
    >
      {props.children}
    </a>
  </span>
)

export default StyledLink
