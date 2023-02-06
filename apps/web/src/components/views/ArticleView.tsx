import { Badge } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { FC } from "react"
import { Article } from "src/api/get-article"

import PortableText from "@components/molecules/PortableText"

interface ArticleViewProps {
  article: Article
}

export const ArticleView: FC<ArticleViewProps> = (props: ArticleViewProps) => {
  const { title, author, photographer, _createdAt, tags, excerpt, cover_image, content, estimatedReadingTime } =
    props.article

  const date = new Date(_createdAt)

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col">
      <div>
        <h1>{title}</h1>
        <div className="flex flex-row justify-between">
          <div>
            <p>
              Skrevet av <span>{author}</span>
            </p>
            <p>
              Foto av <span>{photographer}</span>
            </p>
          </div>
          <div>
            <p>
              Publisert <span>{format(date, "dd MMM yyyy")}</span>
            </p>
            <p>
              {estimatedReadingTime} minutter <span>for å lese</span>
            </p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap justify-start pb-4">
          {tags.map((tag: string, key: number) => (
            <Badge key={key} variant="light" color="slate">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="pb-1 text-black">{excerpt}</p>
      </div>
      {cover_image && (
        <div className="mx-auto max-h-[400px]">
          <Image width={800} height={400} src={cover_image.asset.url} alt="cover image" />
        </div>
      )}
      <PortableText className="prose" blocks={content} />
    </div>
  )
}
