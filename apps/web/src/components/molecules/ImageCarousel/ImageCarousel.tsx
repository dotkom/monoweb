import { useState } from "react"

interface ImageCarouselProps {
  images: string[]
  pdfs: string[]
}
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, pdfs }) => {
  const [currentPos, setCurrentPos] = useState(0)
  const [isHoveredRight, setIsHoveredRight] = useState(false)
  const [isHoveredLeft, setIsHoveredLeft] = useState(false)

  const imgWidth = 196
  const imgMargin = 14
  const imgWMargin = imgWidth + imgMargin
  const imagesPerSlide = 4
  const totalWidth = imgWMargin * images.length
  const slideNum = Math.ceil(images.length / imagesPerSlide)

  const handleLeftButtonClick = () => {
    setCurrentPos((prev) => Math.max(prev - imgWMargin * imagesPerSlide, 0))
  }

  const handleRightButtonClick = () => {
    setCurrentPos((prev) => Math.min(prev + imgWMargin * imagesPerSlide, totalWidth - imgWMargin * imagesPerSlide - 46))
  }

  return (
    <div>
      <p>OFFLINE</p>
      <div className="flex flex-row space-x-8">
        <button
          onMouseEnter={() => setIsHoveredLeft(true)}
          onMouseLeave={() => setIsHoveredLeft(false)}
          onClick={handleLeftButtonClick}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-arrow-narrow-left h-14 w-14 duration-300 hover:scale-110"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke={isHoveredLeft ? "gray" : "lightgray"}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Left arrow</title>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l14 0" />
            <path d="M9 16l-4 -4" />
            <path d="M9 8l-4 4" />
          </svg>
        </button>

        <div className="relative overflow-hidden">
          <div
            className="flex w-[960px] transition-transform duration-500"
            style={{ transform: `translateX(-${currentPos}px)`, transitionDuration: "1s" }}
          >
            {images.map((image, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: pictures don't change
              <a key={index} href={pdfs[index]} className="mr-4 w-56 flex-shrink-0 hover:scale-105">
                <img src={image} alt="Offline" className="block w-full" />
              </a>
            ))}
          </div>
        </div>

        <button
          onMouseEnter={() => setIsHoveredRight(true)}
          onMouseLeave={() => setIsHoveredRight(false)}
          onClick={handleRightButtonClick}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-arrow-narrow-right h-14 w-14 duration-300 hover:scale-110"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke={isHoveredRight ? "gray" : "lightgray"}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Right arrow</title>
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
