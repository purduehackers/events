import Image from 'next/image'
import { ImageMetadata } from 'sanity'

const ImageCard = ({
  image,
  index,
  click
}: {
  image: SanityImage
  index: number
  click?: Function
}) => {
  const metadata: ImageMetadata = image.metadata
  return (
    <div className="flex flex-col mx-auto hover:scale-[1.03] transition transform">
      <Image
        alt="Gallery image"
        src={image.url}
        width={metadata.dimensions.width}
        height={metadata.dimensions.height}
        placeholder="blur"
        blurDataURL={metadata.lqip}
        priority
        className="rounded-lg"
        onClick={() => (click ? click(index) : {})}
      />
    </div>
  )
}

export default ImageCard
