import type { ArticleTagName } from "@dotkomonline/types"
import { Text, TextInput } from "@dotkomonline/ui"
import clsx from "clsx"
import Link from "next/link"
import type { Dispatch, FC, SetStateAction } from "react"

interface ArticleFiltersContainerProps {
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  tags: ArticleTagName[]
  selectedTag: ArticleTagName | null
}

export const ArticleFiltersContainer: FC<ArticleFiltersContainerProps> = ({
  search,
  setSearch,
  tags,
  selectedTag,
}: ArticleFiltersContainerProps) => {
  return (
    <div className="border-slate-200 h-fit rounded-lg border shadow-b-sm py-4">
      <div className="border-slate-200 flex flex-row justify-between border-b pb-4">
        <Text className="mx-4 my-auto text-lg align-middle">Filter</Text>
      </div>
      <div className="mx-4">
        <Text className="mt-4 mb-2">Søk</Text>
        <TextInput
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          placeholder="Søk etter artikler"
          value={search}
        />
      </div>
      <div className="mx-4">
        <Text className="mt-4">Tags</Text>
        <div className="flex flex-wrap gap-x-4 gap-y-3 mt-2">
          {tags
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((tag) => (
              <ArticleTagFilterItem key={tag} tag={tag} selected={tag === selectedTag} />
            ))}
        </div>
        <div />
      </div>
    </div>
  )
}

interface ArticleTagFilterItemProps {
  tag: ArticleTagName
  selected: boolean
}

const ArticleTagFilterItem = ({ tag, selected }: ArticleTagFilterItemProps) => {
  const link = selected ? "/artikler" : `?tag=${tag}`

  return (
    <Link
      href={link}
      scroll={false}
      className={clsx(
        "py-1 px-3 rounded-lg border w-fit dark:text-black",
        selected ? "bg-blue-400 hover:bg-blue-500 border-blue-500" : "bg-slate-200 hover:bg-slate-400 border-slate-500"
      )}
    >
      {tag}
    </Link>
  )
}
