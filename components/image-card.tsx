import Image from 'next/image'

const resizeImage = (image: AirtableAttachment): AirtableAttachment => {
  image.height = (image.height * 500) / image.width
  image.width = 500
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
