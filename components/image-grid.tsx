import StyledImage from './styled-image'

const ImageGrid = ({ images = [] }: { images: Array<AirtableAttachment> }) => (
  <div className="flex flex-col gap-y-4">
    <div className="mx-auto md:w-1/2 md:columns-2">
      {images.map((image, i) => {
        return (
          i < 3 && (
            <StyledImage
              src={image.url}
              width={image.width}
              height={image.height}
              key={image.url}
            />
          )
        )
      })}
    </div>
    <a
      href="#"
      target="_blank"
      className="mx-auto rounded-lg shadow-md dark:shadow-black bg-amber-400 dark:bg-amber-500 p-2 text-center hover:scale-105 transform transition font-bold text-black dark:text-black"
    >
      See all photos
    </a>
  </div>
)

export default ImageGrid
