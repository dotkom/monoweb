import "server-only"
import { fileTypeFromBlob } from "file-type"
import { ulid } from "ulid"
import { uploadToStatic } from "./s3"

export type ActionConfiguration = {
  allowedTypes: string[]
  inputName: string
  keyPrefix?: string
  generateFileName?(form: FormData): string
}

export const getActionHandler = ({
  inputName,
  allowedTypes,
  keyPrefix,
  generateFileName = () => ulid(),
}: ActionConfiguration) =>
  async function action(form: FormData) {
    "use server"
    if (!form.has(inputName)) {
      return new Error(`request did not declare '${inputName}'`)
    }
    const file = form.get(inputName)
    if (!(file instanceof File)) {
      return new Error(`request value for '${inputName}' was not a file`)
    }
    const mime = await fileTypeFromBlob(file)
    if (!mime?.mime || !allowedTypes.includes(mime?.mime)) {
      return new Error("invalid mime type")
    }
    const key = keyPrefix ? `${keyPrefix}/${generateFileName(form)}` : generateFileName(form)
    await uploadToStatic(file, key)
  }
