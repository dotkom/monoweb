import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SettingsLanding } from "@/components/views/SettingsView/components";

const SettingsPage = async () => {
  const session = await getServerSession();

  if (session === null) {
    redirect("/");
  }

  return <SettingsLanding user={session.user} />;
};

export default SettingsPage;
