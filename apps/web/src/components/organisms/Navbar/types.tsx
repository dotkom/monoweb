export type MenuItem = {
  title: string
  href: string
  description?: string
}
export type MenuLink =
  | MenuItem
  | {
      title: string
      items: MenuItem[]
    }
