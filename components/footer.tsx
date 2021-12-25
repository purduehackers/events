const Footer = ({ ...props }) => (
  <div className="bg-gray-100 dark:bg-gray-800 text-center dark:text-gray-100 bottom-0 mt-auto w-full flex flex-col justify-center gap-y-4 py-8 px-4">
    {props.children}
  </div>
)

export default Footer
