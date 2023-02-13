import 'react-image-lightbox/style.css'

import Lightbox from 'react-image-lightbox'

const Gallery = ({
  imageUrls,
  index,
  open,
  onClose,
  setIndex
}: {
  imageUrls: string[]
  index: number
  open: boolean
  onClose: Function
  setIndex: Function
}) => {
  // const [index, setIndex] = useState(0)
  // const [open, setOpen] = useState(false)

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
