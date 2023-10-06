import { Icon, cn } from "@dotkomonline/ui";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./NavigationMenu";
import { type MenuLink } from "./types";

export const MobileNavigation: FC<{ links: Array<MenuLink> }> = ({ links }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [open]);

  return (
    <Popover.Root onOpenChange={(val) => setOpen(val)}>
      <Popover.Trigger>
        <div className={cn("mr-7 flex items-center md:hidden")}>
          {open ? <Icon height={32} icon="tabler:menu-2" /> : <Icon height={32} icon="tabler:x" />}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="animate-in fade-in-20 bg-indigo-1 h-screen w-screen">
          <NavigationMenu className="[&>div]:w-full">
            <NavigationMenuList className="flex-col">
              {links.map((link) => (
                <NavigationMenuItem className="w-full" key={link.title}>
                  {/* Flatten the list of navigation links */}
                  {"items" in link ? (
                    <>
                      {link.items.map((item) => (
                        <MobileMenuItem key={`menu-item-${item.title}`} link={item} />
                      ))}
                    </>
                  ) : (
                    <MobileMenuItem link={link} />
                  )}
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem></NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const MobileMenuItem = ({ link }: { link: MenuLink }) => (
  <NavigationMenuLink asChild>
    <Link
      className="border-blue-12/10 mx-8 flex h-14 w-[calc(100%-theme(space.16))] items-center border-b text-lg font-semibold"
      href={"href" in link ? link.href : "#"}
    >
      {link.title}
    </Link>
  </NavigationMenuLink>
);
