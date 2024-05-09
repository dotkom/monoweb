import type { FileAsset, ImageAsset } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useFileAssetCreateForm } from "../../components/molecules/FileForm/file-asset-create-form"
import { useFileAssetUpdateForm } from "../../components/molecules/FileForm/file-asset-update-form"
import { useImageAssetCreateForm } from "../../components/molecules/FileForm/image-asset-create-form"
import { useImageAssetUpdateForm } from "../../components/molecules/FileForm/image-asset-update-form"
import {
  useCreateFileAssetMutation,
  useCreateImageAssetMutation,
  useUpdateFileAssetMutation,
  useUpdateImageAssetMutation,
} from "./mutations"
import { useFileAssetsAllQuery, useImageAssetsAllQuery } from "./queries"

interface PickImageAssetProps {
  onSelect: (image: ImageAsset) => void
}
export const ImageAssetFromGalleryInput = ({ onSelect }: PickImageAssetProps) => {
  const { imageAssets, isLoading } = useImageAssetsAllQuery()
  return isLoading ? (
    <div>Laster...</div>
  ) : (
    <div>
      {imageAssets.map((image) => (
        <div key={image.key}>
          <div>{image.title}</div>
          <div>{image.originalFilename}</div>
          <button type="button" onClick={() => onSelect(image)}>
            Velg
          </button>{" "}
        </div>
      ))}
    </div>
  )
}
interface PickFileAssetProps {
  onSelect: (file: FileAsset) => void
}
export const FileAssetFromGalleryInput = ({ onSelect }: PickFileAssetProps) => {
  const { fileAssets, isLoading } = useFileAssetsAllQuery()

  return isLoading ? (
    <div>Laster...</div>
  ) : (
    <div>
      {fileAssets.map((file) => (
        <div key={file.key}>
          <div>{file.title}</div>
          <div>{file.originalFilename}</div>
          <button type="button" onClick={() => onSelect(file)}>
            Velg
          </button>{" "}
        </div>
      ))}{" "}
    </div>
  )
}

export const ImageAssetCreateModal: FC<ContextModalProps> = ({ context, id, innerProps }) => {
  const mutation = useCreateImageAssetMutation()
  const ImageAssetForm = useImageAssetCreateForm({
    onSubmit: async (values) => {
      mutation.mutate({
        title: values.title,
        tags: values.tags,
        photographer: values.photographer,
        altText: values.altText,
        key: values.file.key,
        originalFilename: values.file.originalFilename,
        mimeType: values.file.mimeType,
        size: values.file.size,
        width: values.file.width,
        height: values.file.height,
      })
      context.closeModal(id)
    },
  })

  return <ImageAssetForm />
}

export const ImageAssetUpdateModal: FC<ContextModalProps<{ defaultValues: ImageAsset }>> = ({
  context,
  id,
  innerProps,
}) => {
  const mutate = useUpdateImageAssetMutation()
  const defaultValues = innerProps.defaultValues
  const ImageAssetForm = useImageAssetUpdateForm({
    onSubmit: async (values) => {
      mutate.mutate({
        id: defaultValues.key,
        image: {
          title: values.title,
          tags: values.tags,
          photographer: values.photographer,
          altText: values.altText,
        },
      })
      context.closeModal(id)
    },
    defaultValues: {
      title: defaultValues.title,
      tags: defaultValues.tags,
      photographer: defaultValues.photographer,
      altText: defaultValues.altText,
    },
  })

  return <ImageAssetForm />
}

export const FileAssetCreateModal: FC<ContextModalProps> = ({ context, id }) => {
  const mutation = useCreateFileAssetMutation()
  const FileAssetForm = useFileAssetCreateForm({
    onSubmit: async (values) => {
      mutation.mutate({
        title: values.title,
        tags: values.tags,
        key: values.file.key,
        originalFilename: values.file.originalFilename,
        mimeType: values.file.mimeType,
        size: values.file.size,
      })
      context.closeModal(id)
    },
  })

  return <FileAssetForm />
}

export const FileAssetUpdateModal: FC<ContextModalProps<{ defaultValues: FileAsset }>> = ({
  context,
  id,
  innerProps,
}) => {
  const mutation = useUpdateFileAssetMutation()
  const defaultValues = innerProps.defaultValues
  const FileAssetForm = useFileAssetUpdateForm({
    onSubmit: async (values) => {
      mutation.mutate({
        id: defaultValues.key,
        file: {
          title: values.title,
          tags: values.tags,
        },
      })
      context.closeModal(id)
    },
    defaultValues: {
      title: defaultValues.title,
      tags: defaultValues.tags,
    },
  })

  return <FileAssetForm />
}

export const assetModals = {
  "asset/images/create": ImageAssetCreateModal,
  "asset/images/update": ImageAssetUpdateModal,
  "asset/files/create": FileAssetCreateModal,
  "asset/files/update": FileAssetUpdateModal,
} as const

export const useCreateImageAssetModal = () => () =>
  modals.openContextModal({
    modal: "asset/images/create",
    title: "Last opp bilde",
    innerProps: {},
  })

export const useCreateFileAssetModal = () => () =>
  modals.openContextModal({
    modal: "asset/files/create",
    title: "Last opp fil",
    innerProps: {},
  })

export const useUpdateImageAssetModal = () => (image: ImageAsset) =>
  modals.openContextModal({
    modal: "asset/images/update",
    title: "Rediger bilde",
    innerProps: {
      defaultValues: image,
    },
  })

export const useUpdateFileAssetModal = () => (file: FileAsset) =>
  modals.openContextModal({
    modal: "asset/files/update",
    title: "Rediger fil",
    innerProps: {
      defaultValues: file,
    },
  })
