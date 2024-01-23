const DescriptionBox = ({ ...props }) => (
  <div className="container mx-auto p-8 px-4 md:px-16 lg:px-64 xl:px-96">
    <div className="border-2 border-dashed rounded-lg p-4 border-amber-400 dark:border-amber-500 break-all">
      {props.children}
    </div>
  </div>
)

export default DescriptionBox
