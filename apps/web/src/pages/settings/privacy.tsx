import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfilePrivacy } from "@/components/views/SettingsView/components";
import { type NextPageWithLayout } from "../_app";

const PrivacyPage: NextPageWithLayout = () => <ProfilePrivacy />;

PrivacyPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
);

export default PrivacyPage;
