import Link from 'next/link'

const StyledLink = ({ destination, ...props }) => (
  <span>
  <Link href={destination} passHref>
    <a href="#" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition">
      {props.children}
    </a>
  </Link>
</span>
)

export default StyledLink