import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  SettingsPassword,
  SettingsPrivacy,
} from "@/components/views/SettingsView/components";
import { User } from "@dotkomonline/types";

const PrivacyPage = async () => {
  const session = await getServerSession();

  if (session === null) {
    redirect("/");
  }

  return <SettingsPrivacy />;
};

export default PrivacyPage;
