import Link from 'next/link'

type StyledLinkProps = {
  destination: string;
  color?: string;
  newTab?: boolean;
  children?: any;
}

const StyledLink = ({ destination, color = "text-yellow-500 hover:text-yellow-400", newTab = false, ...props }: StyledLinkProps) => (
  <span>
    <Link href={destination} passHref>
      <a href="#" target={newTab ? "blank" : ""} className={`${color} transition`}>
        {props.children}
      </a>
    </Link>
  </span>
)

export default StyledLink