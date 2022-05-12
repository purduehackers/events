import ImageCard from './image-card'
import StyledButton from './styled-button'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => {
  images = images.filter((image) => image.width > image.height)
  return (
    <div className="flex flex-col gap-y-4 items-center justify-center">
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-3 md:gap-x-2 w-3/4">
        {images.map((image, i) => {
          return i < 3 && <ImageCard image={image} />
        })}
      </div>
      <StyledButton>See all photos</StyledButton>
    </div>
  )
}

export default ImageGrid
