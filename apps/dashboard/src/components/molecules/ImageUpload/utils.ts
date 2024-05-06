export async function getFileFromUrl(url: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], "image.png", { type: "image/png" })
}
