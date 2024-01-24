import { FC } from "react"

interface ImageCarouselProps{
    images: string
}
const ImageCarousel: FC<ImageCarouselProps> = (props) => {
    return <div className=" bg-red-8 rounded-[31px] w-full">ghgf{props.images}</div>
} 

export default ImageCarousel