import { cn } from "#lib/utils"

export const richTextSharedClasses = cn(
  "prose text-base max-w-none dark:prose-stone dark:prose-invert",
  "prose-headings:font-title prose-headings:font-bold",
  "prose-a:text-blue-600 dark:prose-a:text-blue-300",
  "[&_ul>li::marker]:text-black dark:[&_ul>li::marker]:text-white",
  "[&_ol>li::marker]:text-black dark:[&_ol>li::marker]:text-white",
  "prose-pre:p-2.5 prose-code:rounded-md prose-pre:border prose-pre:border-gray-200 prose-pre:bg-gray-100 prose-pre:dark:bg-stone-800 prose-pre:dark:border-stone-700",
  "prose-code:text-black prose-code:dark:text-white",
  "prose-table:prose-sm",
  "prose-img:rounded-md",
  "[&_li>p]:my-0 [&_th>p]:my-0 [&_td>p]:my-0"
)

const richTextReaderOnlyClasses = cn(
  "[&_.table-wrapper]:overflow-x-auto",
  "[&_.image-wrapper]:overflow-x-auto",
  "prose-img:max-w-none",
  "prose-th:p-2.5 prose-th:align-top prose-th:h-fit prose-th:border prose-th:border-(--tw-prose-td-borders)",
  "prose-td:p-2.5 prose-td:align-top prose-td:h-fit prose-td:border prose-td:border-(--tw-prose-td-borders)",
  "[&_p:empty]:m-0 [&_p:empty]:before:content-[''] [&_p:empty]:before:block [&_p:empty]:before:h-3"
)

export const richTextClasses = cn(richTextSharedClasses, richTextReaderOnlyClasses)

export const richTextInputClasses = cn(
  "min-h-[12rem] p-3 focus-within:outline-none",
  "[&_.ProseMirror]:min-h-[10rem] [&_.ProseMirror]:outline-none"
)
