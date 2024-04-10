import type { Story } from "@ladle/react"
import { AvatarGroup } from "./AvatarGroup"

export default {
  title: "AvatarGroup",
  component: AvatarGroup,
}

export function AvatarDemo() {
  const avatarUrls = Array.from({ length: 10 }, (_, i) => `https://i.pravatar.cc/150?img=${i}`)

  return <AvatarGroup avatarUrls={avatarUrls} maxAvatars={3} />
}

export const Sizes: Story = () => {
  const avatarUrls = Array.from({ length: 10 }, (_, i) => `https://i.pravatar.cc/150?img=${i}`)

  return (
    <div>
      <AvatarGroup size="sm" avatarUrls={avatarUrls} maxAvatars={3} />
      <AvatarGroup size="md" avatarUrls={avatarUrls} maxAvatars={3} />
      <AvatarGroup size="lg" avatarUrls={avatarUrls} maxAvatars={3} />
      <AvatarGroup size="xl" avatarUrls={avatarUrls} maxAvatars={3} />
    </div>
  )
}
