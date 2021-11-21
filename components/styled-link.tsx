import Link from 'next/link'

const StyledLink = ({ destination, newTab = false, ...props }) => (
  <span>
  <Link href={destination} passHref>
    <a href="#" target={newTab ? "blank" : ""} className="text-yellow-500 hover:text-yellow-400 transition">
      {props.children}
    </a>
  </Link>
</span>
)

export default StyledLink