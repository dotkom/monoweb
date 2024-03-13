import { Icon, cn } from "@dotkomonline/ui";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface ProfileMenuItemProps {
  menuItem: {
    title: string;
    slug: string;
    icon: string;
  };
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter();

  const { title, slug, icon } = menuItem;

  const [isCurrent, setCurrent] = useState("");

  useEffect(() => {
    setCurrent(router.pathname === slug ? "bg-slate-4" : "");
  }, [router.pathname, slug]);

  return (
    <Link
      href={slug}
      className={cn(
        "text-slate-12 flex flex-row items-center hover:cursor-pointer hover:bg-slate-4 px-3 py-2 rounded-lg",
        isCurrent
      )}
    >
      <div className={cn("mr-4 h-7 w-7")}>
        <Icon icon={icon} width="w-7" />
      </div>
      <p className="">{title}</p>
    </Link>
  );
};

export default ProfileMenuItem;
