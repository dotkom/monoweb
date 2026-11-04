import Image from "next/image"

export function AppleCalendarLogo() {
  return (
    <>
      <Image src="/logo-apple-light.svg" alt="" width={16} height={16} className="size-4 dark:hidden" />
      <Image src="/logo-apple-dark.svg" alt="" width={16} height={16} className="size-4 not-dark:hidden" />
    </>
  )
}
