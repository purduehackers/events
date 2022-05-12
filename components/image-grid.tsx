import ImageCard from './image-card'
import StyledButton from './styled-button'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => {
  images = images.filter((image) => image.width > image.height)
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col flex-wrap space-y-2 md:flex-row md:space-x-2">
        {images.map((image, i) => {
          return i < 3 && <ImageCard image={image} />
        })}
      </div>
      <StyledButton>See all photos</StyledButton>
    </div>
  )
}

export default ImageGrid
