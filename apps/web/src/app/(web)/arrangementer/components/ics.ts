const ICS_MIME_TYPE = "text/calendar;charset=utf-8"

function createIcsObjectUrl(icsBody: string) {
  const blob = new Blob([icsBody], { type: ICS_MIME_TYPE })

  return URL.createObjectURL(blob)
}

export function openIcsFile(icsBody: string) {
  const objectUrl = createIcsObjectUrl(icsBody)
  const link = document.createElement("a")

  link.href = objectUrl
  link.target = "_blank"
  link.rel = "noopener noreferrer"
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

export function downloadIcsFile(icsBody: string, filename: string) {
  const objectUrl = createIcsObjectUrl(icsBody)
  const link = document.createElement("a")

  link.href = objectUrl
  link.download = filename
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}
