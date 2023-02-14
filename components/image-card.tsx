import Image from 'next/image'

const ImageCard = ({
  image,
  index,
  click
}: {
  image: any
  index: number
  click?: Function
}) => {
  return (
    <div className="flex flex-col mx-auto hover:scale-[1.03] transition transform">
      <Image
        alt="Gallery image"
        src={image.url}
        width={image.metadata.dimensions.width}
        height={image.metadata.dimensions.height}
        placeholder="blur"
        blurDataURL={image.metadata.lqip}
        priority
        className="rounded-lg"
        onClick={() => (click ? click(index) : {})}
      />
    </div>
  )
}

export default ImageCard
