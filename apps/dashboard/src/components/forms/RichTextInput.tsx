import { Input } from "@mantine/core"
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  MDXEditor,
  type MDXEditorProps,
  Separator,
  UndoRedo,
  frontmatterPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createRichTextInput<F extends FieldValues>({
  onChange,
  required,
  label,
  ...props
}: Omit<MDXEditorProps, "error"> & { required: boolean; label: string }): InputProducerResult<F> {
  return function RichTextInput({ name, control }) {
    return (
      <>
        <Input.Wrapper>
          <Input.Label required={required}>{label}</Input.Label>

          <div style={{ border: "1px solid lightgrey", borderRadius: "8px", padding: 0 }}>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <MDXEditor
                  {...props}
                  markdown={field.value}
                  plugins={[
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <ListsToggle />
                          <CodeToggle />
                          <Separator />
                          <BlockTypeSelect />
                          <CreateLink />
                          <Separator />
                        </>
                      ),
                    }),
                    listsPlugin(),
                    headingsPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    thematicBreakPlugin(),
                    frontmatterPlugin(),
                    markdownShortcutPlugin(),
                  ]}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </Input.Wrapper>
      </>
    )
  }
}
