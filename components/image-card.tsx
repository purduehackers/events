import Image from 'next/image'

const ImageCard = ({ image }: { image: AirtableAttachment }) => (
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

export default ImageCard
