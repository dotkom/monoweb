import { FC, useState } from "react"

interface ImageCarouselProps {
  images: string[]
}
const ImageCarousel: FC<ImageCarouselProps> = ({ images }) => {
  const [startIndex, setStartIndex] = useState(0)

  const handleLeftButtonClick = () => {
    const newIndex = Math.max(0, startIndex - 5)
    setStartIndex(newIndex)
  }
  const handleRightButtonClick = () => {
    const newIndex = Math.min(startIndex + 5, images.length - 5)
    setStartIndex(newIndex)
  }
  const [isHoveredRight, setIsHoveredRight] = useState(false)
  const [isHoveredLeft, setIsHoveredLeft] = useState(false)

  const visibleImages = images.slice(startIndex, startIndex + 5)
  return (
    <div>
      <p>OFFLINE</p>
      <div className="flex flex-row space-x-8">
        <button
          onMouseEnter={() => setIsHoveredLeft(true)}
          onMouseLeave={() => setIsHoveredLeft(false)}
          onClick={handleLeftButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-arrow-narrow-left"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke={isHoveredLeft ? "gray" : "lightgray"}
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l14 0" />
            <path d="M5 12l4 4" />
            <path d="M5 12l4 -4" />
          </svg>
        </button>
        <div className="flex flex-row space-x-8">
          {visibleImages.map((image, index) => (
            <div key={index} className="bg-blue-11 h-20 w-12 rounded outline-4">
              {image}
            </div>
          ))}
        </div>
        <button
          onMouseEnter={() => setIsHoveredRight(true)}
          onMouseLeave={() => setIsHoveredRight(false)}
          onClick={handleRightButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-arrow-narrow-right"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke={isHoveredRight ? "gray" : "lightgray"}
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l14 0" />
            <path d="M15 16l4 -4" />
            <path d="M15 8l4 4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ImageCarousel
