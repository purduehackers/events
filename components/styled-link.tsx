import Link from 'next/link'

const StyledLink = ({ destination, color = "yellow-500", transitionColor = "yellow-400", newTab = false, ...props }) => (
  <span>
    <Link href={destination} passHref>
      <a href="#" target={newTab ? "blank" : ""} className={`text-${color} hover:text-${transitionColor} transition`}>
        {props.children}
      </a>
    </Link>
  </span>
)

export default StyledLink