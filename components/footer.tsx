import ponderings from "../lib/footerPonderings"

const Footer = ({ ...props }) => {
  return (
    <div className="bg-gray-100 text-center bottom-0 m-0 absolute w-full py-8 px-4">
      {props.children}
    </div>
  )
}

export default Footer