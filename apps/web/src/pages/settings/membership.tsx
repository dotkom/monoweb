import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfileMembership } from "@/components/views/SettingsView/components";
import { type NextPageWithLayout } from "../_app";

const MembershipPage: NextPageWithLayout = () => <ProfileMembership />;

MembershipPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
);

export default MembershipPage;
