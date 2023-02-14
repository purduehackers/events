import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const ImageGallery = ({
  images,
  index,
  open,
  onClose
}: {
  images: any[]
  index: number
  open: boolean
  onClose: Function
}) => {
  let lightboxImages: any[] = []
  images.forEach((image, i) => {
    lightboxImages.push({
      src: image.url,
      description: `${i + 1}/${images.length}`
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

export default ImageGallery
