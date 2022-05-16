import { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'

const Gallery = ({
  images,
  index,
  open,
  onClose,
  setIndex
}: {
  images: Array<AirtableAttachment>
  index: number
  open: boolean
  onClose: Function
  setIndex: Function
}) => {
  // const [index, setIndex] = useState(0)
  // const [open, setOpen] = useState(false)

  let imageUrls: Array<string> = []
  images.map((image) => {
    imageUrls.push(image.url)
  })

  return (
    <div>
      {open && (
        <Lightbox
          mainSrc={imageUrls[index]}
          nextSrc={imageUrls[(index + 1) % imageUrls.length]}
          prevSrc={imageUrls[(index + imageUrls.length - 1) % imageUrls.length]}
          onCloseRequest={() => onClose()}
          onMovePrevRequest={() =>
            setIndex((index + imageUrls.length - 1) % imageUrls.length)
          }
          onMoveNextRequest={() => setIndex((index + 1) % imageUrls.length)}
          imageCaption={`${index + 1}/${imageUrls.length}`}
        />
      )}
    </div>
  )
}

export default Gallery
