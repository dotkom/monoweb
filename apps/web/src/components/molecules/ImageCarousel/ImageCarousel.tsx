import { useState } from "react"
// import { trpc } from "@/utils/trpc"

interface ImageCarouselProps {
  images: string[]
  pdfs: string[]
}
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  // const imagesPerSlide = 5
  // const totalSlides = Math.ceil(images.length / imagesPerSlide)
  const [currentPos, setCurrentPos] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(1)
  const [isHoveredRight, setIsHoveredRight] = useState(false)
  const [isHoveredLeft, setIsHoveredLeft] = useState(false)
  const imgWidth = 196
  const imgMarginR = 14
  const imgWMargin = imgWidth + imgMarginR
  const fullImgPerSlide = 4
  const fourImgWidth = imgWMargin * fullImgPerSlide
  const imgNum = 10
  const imgNumOnLastPage = imgNum % fullImgPerSlide
  const slideNum = Math.ceil(imgNum / fullImgPerSlide)
  // const totalImgWidth = (imgWidth + imgMarginR) * imgNum

  const mapRightImage = (lastPageNum: number) => {
    const mapping = [3, 0, 1, 2]
    return mapping[lastPageNum]
  }

  const handleLeftButtonClick = () => {
    // setCurrentPos((prev) => (prev < fourImgWidth ? 0 : prev - fourImgWidth))
    if (currentSlide > 1) {
      setCurrentSlide((prev) => prev - 1)
      setCurrentPos((prev) => prev - fourImgWidth)
    } else {
      setCurrentPos(0)
    }
  }

  const handleRightButtonClick = () => {
    if (currentSlide < slideNum - 1) {
      setCurrentSlide((prev) => prev + 1)
      setCurrentPos((prev) => prev + fourImgWidth)
    } else {
      setCurrentSlide((prev) => prev + 1)
      setCurrentPos((prev) => prev + imgWMargin * mapRightImage(imgNumOnLastPage) + 150)
    }
  }

  let renderImages = []
  renderImages.push(images[0])
  renderImages.push(images[1])
  renderImages.push(images[2])
  renderImages.push(images[3])

  renderImages.push(images[4])
  renderImages.push(images[5])
  renderImages.push(images[0])
  renderImages.push(images[1])

  renderImages.push(images[2])
  renderImages.push(images[3])
  // renderImages.push(images[4])
  // renderImages.push(images[5])

  // renderImages.push(images[0])
  // renderImages.push(images[1])
  // renderImages.push(images[2])

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
            strokeWidth="1.5"
            stroke={isHoveredLeft ? "gray" : "lightgray"}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
              <img key={index} src={image} alt="Offline" className={`mr-4 w-56 flex-shrink-0`} />
            ))}
          </div>
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
            strokeWidth="1.5"
            stroke={isHoveredRight ? "gray" : "lightgray"}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
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
