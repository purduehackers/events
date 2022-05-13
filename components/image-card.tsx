import Image from 'next/image'

const resizeImage = (image: AirtableAttachment): AirtableAttachment => {
  if (image.width > 750) {
    image.height = (image.height * 750) / image.width
    image.width = 750
  }
  return image
}

const ImageCard = ({ image }: { image: AirtableAttachment }) => {
  image = resizeImage(image)
  return (
    <div className="flex flex-col mx-auto">
      <Image
        src={image.url}
        width={image.width}
        height={image.height}
        key={image.url}
        priority
        className="rounded"
      />
      {/* <div className="bg-gray-700 text-center py-3 rounded-b">Hi</div> */}
    </div>
  )
}

export default ImageCard
