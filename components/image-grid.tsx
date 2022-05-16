import { useEffect, useState } from 'react'
import Gallery from './gallery'
// import Gallery from './gallery'
import ImageCard from './image-card'
import StyledButton from './styled-button'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => {
  const unfilteredImages = images
  images = images.filter((image) => image.width > image.height)

  const [smallScreen, setSmallScreen] = useState(false)
  useEffect(() => {
    if (window.innerWidth < 640) {
      setSmallScreen(true)
    }
  }, [])

  return (
    <div className="flex flex-col gap-y-4 mx-4 sm:mx-0 items-center">
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-3 md:gap-x-2 sm:max-w-lg md:max-w-xl items-center">
        {smallScreen ? (
          <ImageCard image={images[0]} />
        ) : (
          images.map(
            (image, i) => i < 3 && <ImageCard image={image} key={image.url} />
          )
        )}
      </div>
      <Gallery images={unfilteredImages} />
    </div>
  )
}

export default ImageGrid
