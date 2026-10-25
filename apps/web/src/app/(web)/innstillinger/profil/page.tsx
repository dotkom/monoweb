"use client"

import { ProfileImageUploadInput } from "@/app/profil/profile-image-upload/ProfileImageUploadInput"
import { useUploadProfileImage } from "@/app/profil/profile-image-upload/use-upload-profile-image"
import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { Link } from "@/components/link"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl, getSessionRecoveryMessages } from "@dotkomonline/utils"
import { IconArrowLeft } from "@tabler/icons-react"
import { redirect } from "next/navigation"
import { useUserUpdateMutation } from "../mutations"
import { type FormUserWrite, ProfileForm } from "./form"
import SkeletonProfileForm from "./loading"

const EditProfilePage = () => {
  const fullPathname = useFullPathname()
  const {
    sessionUser,
    isLoading: authLoading,
    isInvalid,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
    dbUser,
  } = useAuthenticatedUser()

  const userUpdate = useUserUpdateMutation()
  const uploadProfileImage = useUploadProfileImage(dbUser?.id ?? null)

  if (!authLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (!authLoading && isInvalid && sessionRecoveryMessages !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1" size="xl">
          Rediger profil
        </Title>
        <SessionRecoveryNotice {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  if (authLoading || sessionUser === null || dbUser === null) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between">
          <Title element="h1" size="xl">
            Rediger profil
          </Title>

          <div className="w-24 h-9 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
        </div>

        <SkeletonProfileForm />
      </div>
    )
  }

  const onSubmit = (data: FormUserWrite) => {
    userUpdate.mutate({ id: dbUser.id, input: data })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <Title element="h1" size="xl">
          Rediger profil
        </Title>

        <Button
          element={Link}
          href={`/profil/${dbUser.username}`}
          prefetch={false}
          icon={<IconArrowLeft className="size-5" />}
          className="w-fit"
        >
          Til profil
        </Button>
      </div>

      <ProfileImageUploadInput
        imageUrl={dbUser.imageUrl}
        onSubmit={uploadProfileImage}
        alwaysShowInteractableOverlay
        className="size-32"
      />

      <ProfileForm
        user={dbUser}
        onSubmit={onSubmit}
        isSaving={userUpdate.isPending}
        saveError={userUpdate.error?.message}
        saveSuccess={userUpdate.isSuccess}
        resetSaveState={userUpdate.reset}
      />
    </div>
  )
}

export default EditProfilePage
