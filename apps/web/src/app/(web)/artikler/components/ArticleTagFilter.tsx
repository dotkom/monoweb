"use client"

import { Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Label, Text, cn } from "@dotkomonline/ui"
import { IconChevronDown } from "@tabler/icons-react"

interface ArticleTypeFilterProps {
  availableTags: string[]
  selectedTags: string[]
  onChange: (types: string[]) => void
}

export const ArticleTagFilter = ({ availableTags, selectedTags, onChange }: ArticleTypeFilterProps) => {
  const handleToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
    onChange(newTags)
  }

  return (
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger
        className={cn(
          "cursor-pointer w-full flex items-center justify-between gap-2 font-medium text-gray-500",
          "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-2 h-5.5">
          <Label className="cursor-pointer text-foreground">Tags</Label>
          {selectedTags.length > 0 && (
            <Text
              element="span"
              className="size-5.5 flex items-center justify-center text-xs bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 rounded-full"
            >
              {selectedTags.length}
            </Text>
          )}
        </div>
        <IconChevronDown className="size-[1.25em] transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col pt-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)

            return (
              <div key={tag} className="flex items-center gap-3">
                <Checkbox
                  id={`type-${tag}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(tag)}
                  className="size-5"
                />
                <Label
                  htmlFor={`type-${tag}`}
                  className={cn(
                    "cursor-pointer font-normal text-base md:text-sm text-muted-foreground hover:text-foreground w-full py-1 text-ellipsis",
                    isSelected && "text-foreground"
                  )}
                >
                  {tag}
                </Label>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
