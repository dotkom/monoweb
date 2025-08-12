import { forwardRef } from "react"
import { cn } from "../../utils"

interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imagePosition: "left" | "right" | "top"
  image: string
  alt: string
  children?: React.ReactNode
}
export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  ({ image, imagePosition, alt, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          props.className,
          "relative flex overflow-hidden rounded-2xl max-sm:flex-col ",
          imagePosition === "left" ? " justify-end" : "justify-start"
        )}
      >
        <img
          src={image}
          alt={alt}
          className={cn(
            "object-cover max-sm:h-1/3 max-sm:w-full",
            imagePosition === "right" && "sm:hidden",
            imagePosition === "left" &&
              "sm:absolute sm:left-0 sm:top-0 sm:h-full sm:w-2/5 sm:[clip-path:polygon(0%_0%,_100%_0%,_85%_100%,_0%_100%)]"
          )}
        />
        <div className="sm:w-3/5">{children}</div>
        {imagePosition === "right" && (
          <img
            src={image}
            alt={alt}
            className={cn(
              "absolute right-0 top-0 h-full w-2/5 object-cover max-sm:hidden [clip-path:polygon(15%_0%,_100%_0%,_100%_100%,_0%_100%)]"
            )}
          />
        )}
      </div>
    )
  }
)
