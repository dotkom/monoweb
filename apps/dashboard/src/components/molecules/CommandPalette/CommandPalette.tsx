"use client"

import { IconCommand, IconSearch } from "@tabler/icons-react"

import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@dotkomonline/ui"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import type { SearchItem } from "./command-palette-search"
import { MIN_SEARCH_LENGTH_FOR_RESOURCES, useCommandPaletteItems } from "./use-command-palette-items"

interface CommandPaletteProps {
  isMac: boolean
}

export function CommandPalette({ isMac }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 300)

  const { pages, actions, resources, isFetching } = useCommandPaletteItems(search, debouncedSearch, open)

  const onSelectItem = (item: SearchItem) => {
    setOpen(false)

    if (item.openInNewTab) {
      window.open(item.href, "_blank", "noopener,noreferrer")
      return
    }

    router.push(item.href)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((isOpen) => !isOpen)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const showResourceSkeleton =
    open &&
    search.trim().length >= MIN_SEARCH_LENGTH_FOR_RESOURCES &&
    resources.length === 0 &&
    (search !== debouncedSearch || isFetching)

  const showPages = pages.length > 0
  const showActions = actions.length > 0
  const showResources = resources.length > 0 || showResourceSkeleton
  const showEmptyState = open && !showPages && !showActions && !showResources

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-64 justify-start gap-2 px-3 pr-1.75 font-normal text-muted-foreground active:scale-100"
        onClick={() => setOpen(true)}
        icon={<IconSearch />}
      >
        <span className="min-w-0 flex-1 truncate text-left">Søk...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded-md border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {isMac ? (
            <>
              <IconCommand className="size-3.5" stroke={1.75} />
              <span>K</span>
            </>
          ) : (
            "Ctrl+K"
          )}
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={(nextOpen) => {
          if (nextOpen) {
            return
          }

          setSearch("")
          setSelectedId(undefined)
        }}
      >
        <Command shouldFilter={false} value={selectedId ?? ""} onValueChange={setSelectedId}>
          <CommandInput
            placeholder="Søk etter sider, handlinger eller innhold..."
            value={search}
            onValueChange={(value) => {
              setSearch(value)
              setSelectedId(undefined)
            }}
          />
          <CommandList>
            {showEmptyState && <CommandEmpty>Ingen treff</CommandEmpty>}

            {showPages && <CommandGroupList heading="Sider" items={pages} onSelect={onSelectItem} />}

            {showPages && showActions && <CommandSeparator alwaysRender />}

            {showActions && <CommandGroupList heading="Handlinger" items={actions} onSelect={onSelectItem} />}

            {(showPages || showActions) && showResources && <CommandSeparator alwaysRender />}

            {showResources && (
              <CommandGroupList
                heading="Innhold"
                items={resources}
                onSelect={onSelectItem}
                renderAsSkeleton={showResourceSkeleton}
              />
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

interface CommandGroupListProps {
  heading: string
  items: SearchItem[]
  onSelect: (item: SearchItem) => void
  renderAsSkeleton?: boolean
}

const CommandGroupList = ({ heading, items, onSelect, renderAsSkeleton }: CommandGroupListProps) => {
  return (
    <CommandGroup heading={heading}>
      {renderAsSkeleton ? (
        <>
          <CommandItemSkeleton />
          <CommandItemSkeleton />
          <CommandItemSkeleton />
        </>
      ) : (
        items.map((item) => (
          <CommandItem key={item.id} value={item.id} onSelect={() => onSelect(item)}>
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </CommandItem>
        ))
      )}
    </CommandGroup>
  )
}

const CommandItemSkeleton = () => {
  return (
    <CommandItem disabled>
      <div className="size-4 animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
    </CommandItem>
  )
}
