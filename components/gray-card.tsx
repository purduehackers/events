const GrayCard = ({ ...props }) => (
  <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
    <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-3">
      {props.children}
    </div>
  </div>
)

export default GrayCard
