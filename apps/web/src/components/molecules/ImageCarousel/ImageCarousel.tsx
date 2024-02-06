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
    <div className="flex flex-row space-x-8">
        <button onClick={handleLeftButtonClick}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>
</button>
        <div className="flex flex-row space-x-8">
            {visibleImages.map((image, index) => (
                <div key={index} className="bg-blue-11 w-12 h-20 outline-4 rounded-md rounded">{image}</div>
            ))}
        </div>
        <button onClick={handleRightButtonClick}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>
</button>
        
    </div>
  </div>
} 

export default ImageCarousel