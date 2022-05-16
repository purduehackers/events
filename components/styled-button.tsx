const StyledButton = ({
  xl = false,
  ...props
}: {
  xl?: boolean
  children?: any
}) => (
  <button
    className={`rounded-lg mx-auto py-2 px-2 font-bold dark:text-gray-200 shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 px-4 text-center hover:scale-105 transform transition ${
      xl ? 'text-xl' : 'text-l'
    }`}
  >
    {props.children}
  </button>
)

export default StyledButton
