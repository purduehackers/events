import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'

interface LightboxImage {
  src: string
  description: string
}

const Gallery = ({
  images,
  index,
  open,
  onClose,
}: {
  images: SanityImage[]
  index: number
  open: boolean
  onClose: Function
}) => {
  let lightboxImages: LightboxImage[] = []
  images.forEach((image, i) => {
    lightboxImages.push({
      src: image.url,
      description: `${i + 1}/${images.length}`,
    })
  })
  return (
    <Lightbox
      open={open}
      close={() => onClose()}
      slides={lightboxImages}
      plugins={[Captions]}
      index={index}
    />
  )
}

export default Gallery
