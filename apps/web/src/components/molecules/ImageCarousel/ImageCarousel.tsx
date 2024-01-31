import { FC, useState } from "react"

interface ImageCarouselProps {
  images: string
}

const ImageCarousel: FC<ImageCarouselProps> = (props) => {
  const [currentBoxes, setCurrentBoxes] = useState([0, 1, 2, 3])

  return (
    <div className="flex h-full w-full justify-evenly">
      <button onClick={() => setCurrentBoxes([10, 10, 10])}>button</button>
      {currentBoxes.map((box) => (
        <div className="bg-red-8 flex h-32 w-32 items-center justify-center rounded-[31px]">{box}</div>
      ))}
      <button onClick={() => setCurrentBoxes([10, 10, 10])}>button</button>
    </div>
  )
}

export default ImageCarousel
