import { useState } from 'react'
import Lightbox from 'react-image-lightbox'

const Gallery = ({ images }: { images: Array<AirtableAttachment> }) => {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  let imageUrls: Array<string> = []
  images.map((image) => {
    imageUrls.push(image.url)
  })

  return (
    <div>
      <button
        className="rounded-lg mx-auto py-2 px-2 font-bold text-l dark:text-gray-200 shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 px-4 text-center hover:scale-105 transform transition"
        onClick={(e) => {
          if (!e.metaKey) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        See all photos
      </button>
      {open && (
        <Lightbox
          mainSrc={imageUrls[index]}
          nextSrc={imageUrls[(index + 1) % imageUrls.length]}
          prevSrc={imageUrls[(index + imageUrls.length - 1) % imageUrls.length]}
          onCloseRequest={() => setOpen(false)}
          onMovePrevRequest={() =>
            setIndex((index + imageUrls.length - 1) % imageUrls.length)
          }
          onMoveNextRequest={() => setIndex((index + 1) % imageUrls.length)}
        />
      )}
    </div>
  )
}

export default Gallery
