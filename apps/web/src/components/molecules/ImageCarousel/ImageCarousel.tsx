import { FC } from "react"

interface ImageCarouselProps{
    images: string
}
const ImageCarousel: FC<ImageCarouselProps> = (props) => {
    return <div>
    <p>OFFLINE</p>
    <div className="flex flex-row space-x-8 ">
        <button>&lt;</button>
        <div className="flex flex-row space-x-8 ">
            <div className="bg-blue-11 w-12 h-20">1</div>
            <div className="bg-blue-11 w-12 h-20">2</div>
            <div className="bg-blue-11 w-12 h-20">3</div>
            <div className="bg-blue-11 w-12 h-20">4</div>
            <div className="bg-blue-11 w-12 h-20">5</div>
        </div>
        <button>></button>
    </div>
  </div>
} 

export default ImageCarousel