import { useState } from 'react'

import useMediaQuery from '../lib/hooks/use-media-query'
import Gallery from './gallery'
import ImageCard from './image-card'

type GridImage = {
  image: SanityImage
  index: number
}

const ImageGrid = ({
  images = [],
}: {
  images: SanityImage[] /* Array of Sanity images */
}) => {
  let filteredImages: GridImage[] = []
  images.slice(0, 3).map((image, i) => {
    filteredImages.push({ image, index: i })
  })

  const smallScreen = useMediaQuery('(max-width:768px)')
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const onClose = () => {
    setOpen(false)
  }

  const click = (index: number) => {
    setIndex(index)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-y-4 mx-4 sm:mx-0 items-center">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-x-2 sm:max-w-lg md:max-w-xl items-center">
        {filteredImages.map(
          (image, i) =>
            i < 3 && (
              <ImageCard
                image={image.image}
                index={image.index}
                click={click}
                key={image.image.url}
              />
            )
        )}
        <button
          className="sm:hidden rounded-lg mx-auto py-2 px-2 font-bold text-l dark:text-gray-200 shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 text-center hover:scale-105 transform transition-transform"
          onClick={(e) => {
            if (!e.metaKey) {
              e.preventDefault()
              setIndex(0)
              setOpen(true)
            }
          }}
        >
          {images.length > 3
            ? `See ${images.length - 3} more photos`
            : 'See all photos'}
        </button>
      </div>
      {!smallScreen && (
        <button
          className="rounded-lg mx-auto py-2 px-2 font-bold text-l dark:text-gray-200 shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 text-center hover:scale-105 transform transition-transform"
          onClick={(e) => {
            if (!e.metaKey) {
              e.preventDefault()
              setIndex(0)
              setOpen(true)
            }
          }}
        >
          {images.length > 3
            ? `See ${images.length - 3} more photos`
            : 'See all photos'}
        </button>
      )}
      <Gallery images={images} index={index} open={open} onClose={onClose} />
    </div>
  )
}

export default ImageGrid
