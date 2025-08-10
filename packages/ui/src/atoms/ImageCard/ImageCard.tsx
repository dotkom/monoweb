import { forwardRef } from "react"
import { cn } from "../../utils"

interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imagePosition: "left" | "right" | "top"
  image: string
  children?: React.ReactNode
}
export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  ({ image, imagePosition, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          props.className,
          "relative flex overflow-hidden rounded-2xl max-sm:flex-col ",
          imagePosition === "left" ? " justify-end" : " justify-start"
        )}
      >
        <img
          src={image}
          alt="Image Card"
          className={cn(
            "object-cover",
            imagePosition === "right" && "sm:hidden",
            imagePosition === "left" && "sm:absolute sm:left-0 sm:top-0 sm:h-full sm:w-2/5 "
          )}
          style={{
            clipPath: imagePosition === "left" ? "polygon(0 0, 100% 0, 85% 100%, 0 100%)" : "none",
            WebkitClipPath: imagePosition === "left" ? "polygon(0 0, 100% 0, 85% 100%, 0 100%)" : "none",
          }}
        />
        <div className="sm:w-3/5">{children}</div>
        {imagePosition === "right" && (
          <img
            src={image}
            alt="Image Card"
            className={cn("absolute right-0 top-0 h-full w-2/5 object-cover max-sm:hidden")}
            style={{
              clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
              WebkitClipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
            }}
          />
        )}
      </div>
    )
  }
)
