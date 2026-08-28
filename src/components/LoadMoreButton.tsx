interface LoadMoreButtonProps {
  isLoadingMore: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({ isLoadingMore, onClick }: LoadMoreButtonProps) {
  return (
    <button
      className="cursor-pointer uppercase w-32 m-auto my-2 sm:my-4 py-1 font-pixel text-base text-white dark:text-black bg-purple-700 dark:bg-yellow"
      onClick={onClick}
      disabled={isLoadingMore}
    >
      {isLoadingMore ? "Loading..." : "Load more"}
    </button>
  );
}
