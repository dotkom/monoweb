import { trpc } from "@/utils/trpc"
import { FC, useEffect, useState } from "react"

interface ImageCarouselProps {
  images: string[]
  pdfs: string[]
}
const ImageCarousel: FC<ImageCarouselProps> = ({ images, pdfs }) => {
  // const imagesPerSlide = 5
  // const totalSlides = Math.ceil(images.length / imagesPerSlide)
  const [currentPos, setCurrentPos] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(1)
  const imgWidth = 240
  const imgMarginR = 14
  const fullImgPerSlide = 4
  const fourImgWidth = (imgWidth + imgMarginR) * fullImgPerSlide
  const imgNum = 6
  const imgNumOnLastPage = imgNum % fullImgPerSlide
  const slideNum = Math.ceil(imgNum / fullImgPerSlide)
  const totalImgWidth = (imgWidth + imgMarginR) * imgNum

  const handleLeftButtonClick = () => {
    setCurrentPos((prev) => (prev < fourImgWidth ? 0 : prev - fourImgWidth))
  }

  const handleRightButtonClick = () => {
    // setCurrentPos((prev) => (prev > (slideNum - 1) * fourImgWidth + 960 ? 840 * 2 : prev + fourImgWidth))
    if (currentSlide < slideNum - 1) {
      setCurrentPos((prev) => prev + fourImgWidth)
      setCurrentSlide((prev) => prev + 1)
    } else {
      switch (imgNumOnLastPage) {
        case 0: {
          console.log("0")
          setCurrentSlide(1)
          setCurrentPos(fourImgWidth * currentSlide)
          break
        }
        case 1: {
          console.log("1")
          setCurrentSlide((prev) => prev + 1)
          setCurrentPos((prev) => (prev > (slideNum - 1) * fourImgWidth + 960 ? 840 * 2 : prev + fourImgWidth))
          break
        }
        case 2: {
          console.log("2")
          setCurrentSlide((prev) => prev + 1)
          setCurrentPos((prev) => prev + imgWidth + 200)
          break
        }
        case 3: {
          console.log("3")
          setCurrentSlide((prev) => prev + 1)
          setCurrentPos((prev) => (prev > (slideNum - 1) * fourImgWidth + 960 ? 840 * 2 : prev + fourImgWidth))
          break
        }
        default: {
          console.log("default")
          setCurrentPos(0)
          break
        }
      }
    }

    // setCurrentPos((prev) =>
    //   prev + fourImgWidth + 841 > totalImgWidth ? totalImgWidth - fourImgWidth - 110 : prev + fourImgWidth
    // )
  }

  // xxxxi | xxxxi | ixxxx
  return (
    <div>
      <p>OFFLINE</p>
      <div className="flex flex-row space-x-8">
        <button onClick={handleLeftButtonClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="lightGray"
            className="mr-4 h-6 w-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="relative overflow-hidden">
          <div
            className="flex w-[960px] transition-transform duration-500"
            style={{ transform: `translateX(-${currentPos}px)`, transitionDuration: "1s" }}
          >
            {images.map((image, index) => (
              <img key={index} src={image} alt="Offline" className={`mr-4 w-60 flex-shrink-0`} />
            ))}
          </div>
        </div>

        <button onClick={handleRightButtonClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="lightGray"
            className="h-6 w-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ImageCarousel
