import StyledImage from './styled-image'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => (
  <div className="py-8 sm:pt-14 px-5 sm:px-20 mx-auto md:w-1/2 sm:columns-2">
    {images.map((image, i) => {
      return (
        i < 3 && (
          <StyledImage
            src={image.url}
            width={image.width}
            height={image.height}
          />
        )
      )
    })}
  </div>
)

export default ImageGrid
