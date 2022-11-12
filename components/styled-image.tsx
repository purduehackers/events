import Image from 'next/future/image'

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
    alt="Styled image, generated"
    src={src}
    width={width}
    height={height}
    priority
    className="rounded"
  ></Image>
)

export default StyledImage
