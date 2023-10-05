import { Badge } from "@dotkomonline/ui";
import { format } from "date-fns";
import Image from "next/image";
import { type FC } from "react";
import { type Article } from "src/api/get-article";

import PortableText from "@/components/molecules/PortableText";

interface ArticleViewProps {
    article: Article;
}

export const ArticleView: FC<ArticleViewProps> = (props: ArticleViewProps) => {
    const { title, author, photographer, _createdAt, tags, excerpt, cover_image, content, estimatedReadingTime } =
        props.article;

    const date = new Date(_createdAt);

    return (
        <div className="mx-auto flex w-full flex-col px-6">
            <div className="mx-auto max-w-[75ch]">
                <h1>{title}</h1>
                <div className="flex flex-row justify-between">
                    <ul className="text-slate-11 m-0 my-4 grid w-full grid-cols-2 grid-rows-2 [&>li>span]:font-bold">
                        <li>
                            <span>Skrevet av&nbsp;</span>
                            {author}
                        </li>
                        <li>
                            <span>Foto av&nbsp;</span>
                            {photographer}
                        </li>
                        <li>
                            <span>Publisert&nbsp;</span>
                            {format(date, "dd MMM yyyy")}
                        </li>
                        <li>
                            <span>{estimatedReadingTime} minutter&nbsp;</span> for å lese
                        </li>
                    </ul>
                </div>
                <div className="grid max-w-fit grid-flow-col-dense gap-3">
                    {tags.map((tag: string, key: number) => (
                        <Badge key={key} variant="light" color="slate" className="font-bold">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <p className="my-10 font-bold">{excerpt}</p>
            </div>
            {cover_image && (
                <div className="mx-auto mb-10 max-h-[440]">
                    <Image width={800} height={440} src={cover_image.asset.url} alt="cover image" />
                </div>
            )}
            <div className="prose md:prose-lg dark:prose-invert mx-auto max-w-[75ch]">
                <PortableText blocks={content} />
            </div>
        </div>
    );
};
