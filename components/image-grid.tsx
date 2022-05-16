import { useEffect, useState } from 'react'
import Gallery from './gallery'
// import Gallery from './gallery'
import ImageCard from './image-card'
import StyledButton from './styled-button'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => {
  let filteredImages: Array<AirtableAttachment> = []
  let filteredIndices: Array<number> = []

  images.map((image, i) => {
    if (image.width > image.height) {
      filteredImages.push(image)
      filteredIndices.push(i)
    }
  })

  const [smallScreen, setSmallScreen] = useState(false)
  useEffect(() => {
    if (window.innerWidth < 640) {
      setSmallScreen(true)
    }
  }, [])

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
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-3 md:gap-x-2 sm:max-w-lg md:max-w-xl items-center">
        {smallScreen ? (
          <ImageCard image={filteredImages[0]} index={0} />
        ) : (
          filteredImages.map(
            (image, i) =>
              i < 3 && (
                <ImageCard
                  image={image}
                  index={filteredIndices[i]}
                  click={click}
                  key={image.url}
                />
              )
          )
        )}
      </div>
      <button
        className="rounded-lg mx-auto py-2 px-2 font-bold text-l dark:text-gray-200 shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 px-4 text-center hover:scale-105 transform transition"
        onClick={(e) => {
          if (!e.metaKey) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        See all photos
      </button>
      <Gallery
        images={images}
        index={index}
        open={open}
        onClose={onClose}
        setIndex={setIndex}
      />
    </div>
  )
}

export default ImageGrid
