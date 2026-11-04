import { useUserFileUploadMutation, useUserUpdateMutation } from "@/app/innstillinger/mutations"

export type UploadProfileImageResult =
  | {
      success: true
    }
  | {
      success: false
      error: "UPLOAD_FAILED"
    }

export function useUploadProfileImage(userId: string | null) {
  const fileUpload = useUserFileUploadMutation()
  const userUpdate = useUserUpdateMutation()

  return async (file: File): Promise<UploadProfileImageResult> => {
    if (userId === null || userId === "") {
      return { success: false, error: "UPLOAD_FAILED" }
    }

    try {
      const uploadedUrl = await fileUpload(file)
      await userUpdate.mutateAsync({ id: userId, input: { imageUrl: uploadedUrl } })

      return { success: true }
    } catch {
      return { success: false, error: "UPLOAD_FAILED" }
    }
  }
}
