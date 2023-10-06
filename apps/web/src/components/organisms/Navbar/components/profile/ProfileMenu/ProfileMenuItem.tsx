import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface ProfileMenuItemProps {
  menuItem: {
    slug: string;
    title: string;
  };
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter();

  const { slug, title } = menuItem;

  const [isCurrent, setCurrent] = useState(router.pathname === slug ? "text-white" : "text-slate-7");

  const handleChange = () => {
    router.push(slug);
  };

  useEffect(() => {
    setCurrent(router.pathname === slug ? "text-white" : "text-slate-7");
  }, [router.pathname, slug]);

  return (
    <div className="!hover:text-blue hover:cursor-pointer" onClick={handleChange}>
      <p className={isCurrent}>{title}</p>
    </div>
  );
};

export default ProfileMenuItem;
