import type { JobListingEmployment } from "@dotkomonline/rpc/job-listing"
import { Badge, cn } from "@dotkomonline/ui"
import { IconBriefcase, IconSparkles } from "@tabler/icons-react"
import Image from "next/image"
import type { FC } from "react"
import { JOB_LISTING_EMPLOYMENT_CONFIG } from "./jobListingTypeConfig"

interface JobListingImageProps {
  imageUrl?: string | null
  alt: string
  employment: JobListingEmployment
  featured?: boolean
  className?: string
  imageClassName?: string
  sizes?: string
}

export const JobListingImage: FC<JobListingImageProps> = ({
  imageUrl,
  alt,
  employment,
  featured,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
}) => {
  const employmentConfig = JOB_LISTING_EMPLOYMENT_CONFIG[employment]

  return (
    <div className={cn("relative self-start h-fit", className)}>
      <div
        className={cn(
          "relative bg-white dark:bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center",
          imageClassName
        )}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-contain p-4" />
        ) : (
          <IconBriefcase className="size-10 text-gray-300" />
        )}
      </div>

      {featured && (
        <div className="absolute top-1 right-1 rounded-sm bg-background">
          <Badge color="orange" className="px-1 py-0.5 text-xs rounded-sm flex items-center gap-1">
            <IconSparkles className="size-3" />
            Fremhevet
          </Badge>
        </div>
      )}

      <div className="absolute bottom-1 right-1 rounded-sm bg-background">
        <Badge color={employmentConfig.backgroundColor} className="px-1 py-0.5 text-xs rounded-sm flex">
          {employmentConfig.label}
        </Badge>
      </div>
    </div>
  )
}
