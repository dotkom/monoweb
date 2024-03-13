import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { type NextPageWithLayout } from "../_app";

const NotificationPage: NextPageWithLayout = () => <div>Notifications</div>;

NotificationPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
);

export default NotificationPage;
