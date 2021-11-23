import Link from 'next/link'

type StyledLinkProps = {
  destination: string;
  color?: string;
  transitionColor?: string;
  newTab?: boolean;
  children?: string;
}

const StyledLink = ({ destination, color = "yellow-500", transitionColor = "yellow-400", newTab = false, ...props }: StyledLinkProps) => (
  <span>
    <Link href={destination} passHref>
      <a href="#" target={newTab ? "blank" : ""} className={`text-${color} hover:text-${transitionColor} transition`}>
        {props.children}
      </a>
    </Link>
  </span>
)

export default StyledLink