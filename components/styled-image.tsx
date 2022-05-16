import Image from 'next/image'

const StyledImage = ({
  src,
  width,
  height
}: {
  src: string
  width: number
  height: number
}) => (
  <Image
    src={src}
    width={width}
    height={height}
    priority
    className="rounded"
  ></Image>
)

export default StyledImage
