import { FC, useState } from "react"

interface ImageCarouselProps{
    images: string[];
}
const ImageCarousel: FC<ImageCarouselProps> = ({images}) => {
    const [startIndex, setStartIndex] = useState(0);

    const handleLeftButtonClick = () => {
        const newIndex = Math.max(0, startIndex - 5);
        setStartIndex(newIndex);
    };
    const handleRightButtonClick = () => {
        const newIndex = Math.min(startIndex + 5, images.length - 5);
        setStartIndex(newIndex);
    };

    const visibleImages = images.slice(startIndex, startIndex + 5);
    return <div>
    <p>OFFLINE</p>
    <div className="flex flex-row space-x-8 ">
        <button onClick={handleLeftButtonClick}>&lt;</button>
        <div className="flex flex-row space-x-8 ">
            {visibleImages.map((image, index) => (
                <div key={index} className="bg-blue-11 w-12 h-20">{image}</div>
            ))}
        </div>
        <button onClick={handleRightButtonClick}>&gt;</button>
    </div>
  </div>
} 

export default ImageCarousel