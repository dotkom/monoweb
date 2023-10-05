export interface MenuItem {
    description?: string;
    href: string;
    title: string;
}
export type MenuLink =
    | {
          items: Array<MenuItem>;
          title: string;
      }
    | MenuItem;
