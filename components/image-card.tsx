import { createClient } from 'next-sanity'
import { useNextSanityImage } from 'next-sanity-image'
import Image from 'next/future/image'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true
})

const ImageCard = ({
  image,
  index,
  click
}: {
  image: any
  index: number
  click?: Function
}) => {
  const imageProps = useNextSanityImage(client, image)
  return (
    <div className="flex flex-col mx-auto hover:scale-[1.03] transition transform">
      <Image
        alt="Gallery image"
        {...imageProps}
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
