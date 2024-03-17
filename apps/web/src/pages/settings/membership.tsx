import MainLayout from "@/components/layout/MainLayout";
import SettingsLayout from "@/components/layout/SettingsLayout";
import { SettingsMembership } from "@/components/views/SettingsView/components";
import { type NextPageWithLayout } from "../_app";

const MembershipPage: NextPageWithLayout = () => <SettingsMembership />;

MembershipPage.getLayout = (page) => (
  <MainLayout>
    <SettingsLayout>{page}</SettingsLayout>
  </MainLayout>
);

export default MembershipPage;
