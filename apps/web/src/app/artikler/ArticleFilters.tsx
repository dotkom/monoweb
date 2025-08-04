import type { ArticleFilterQuery, ArticleTagName } from "@dotkomonline/types"
import { Button, Label, Text, TextInput } from "@dotkomonline/ui"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: ArticleFilterQuery): void
  tags: ArticleTagName[]
  defaultValues: ArticleFilterQuery
}

export const ArticleFilters = ({ onChange, tags, defaultValues }: Props) => {
  const form = useForm<ArticleFilterQuery>({
    defaultValues: defaultValues,
  })
  const data = useWatch(form)
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  const handleSubmit = (values: ArticleFilterQuery) => {
    onChange(values)
  }

  return (
    <div className="border-gray-200 h-fit rounded-lg border shadow-b-sm py-4">
      <div className="border-gray-200 flex flex-row justify-between border-b pb-4">
        <Text className="mx-4 my-auto text-lg align-middle">Filter</Text>
      </div>
      <div className="mx-4">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Label htmlFor="bySearchTerm" className="mt-4 mb-2 text-md">
            Søk
          </Label>
          <TextInput id="bySearchTerm" placeholder="Søk etter artikler..." {...form.register("bySearchTerm")} />
          <Text className="mt-4">Tags</Text>
          <Controller
            name="byTags"
            control={form.control}
            render={({ field: { onChange, value = [] } }) => (
              <div className="flex flex-wrap gap-x-4 gap-y-3 mt-2">
                {tags.map((tag) => {
                  const selected = !!value?.includes(tag)

                  const handleClick = (tag: ArticleTagName) => {
                    onChange(selected ? value.filter((t) => t !== tag) : [tag, ...value])
                  }

                  return <TagFilterItem key={tag} tag={tag} selected={selected} onClick={handleClick} />
                })}
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}

interface TagFilterItemProps {
  tag: ArticleTagName
  selected: boolean
  onClick(tag: ArticleTagName): void
}

const TagFilterItem = ({ tag, selected, onClick }: TagFilterItemProps) => {
  return (
    <Button type="button" onClick={() => onClick(tag)} color={selected ? "brand" : "light"}>
      {tag}
    </Button>
  )
}
