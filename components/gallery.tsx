import 'react-image-lightbox/style.css'

import Lightbox from 'react-image-lightbox'

const Gallery = ({
  images,
  index,
  open,
  onClose,
  setIndex
}: {
  images: any[]
  index: number
  open: boolean
  onClose: Function
  setIndex: Function
}) => {
  return (
    <div>
      {open && (
        <Lightbox
          mainSrc={images[index].url}
          nextSrc={images[(index + 1) % images.length].url}
          prevSrc={images[(index + images.length - 1) % images.length].url}
          onCloseRequest={() => onClose()}
          onMovePrevRequest={() =>
            setIndex((index + images.length - 1) % images.length)
          }
          onMoveNextRequest={() => setIndex((index + 1) % images.length)}
          imageCaption={`${index + 1}/${images.length}`}
        />
      )}
    </div>
  )
}

export default Gallery
