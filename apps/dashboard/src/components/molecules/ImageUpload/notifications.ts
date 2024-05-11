import { notifyComplete, notifyLoading } from "../../../app/notifications"

export const imageUploadNotifications = {
  fileUpload: {
    uploadS3: () =>
      notifyLoading({
        title: "Laster",
        message: "Laster opp til S3...",
        id: "image-upload",
        method: "show",
        autoClose: false,
      }),
    syncBackend: () =>
      notifyLoading({
        title: "Laster",
        message: "Synkroniserer med backend...",
        id: "image-upload",
        method: "update",
        autoClose: false,
      }),
    complete: () =>
      notifyComplete({
        title: "Suksess",
        message: "",
        id: "image-upload",
        method: "update",
        autoClose: 300,
      }),
  },
}
