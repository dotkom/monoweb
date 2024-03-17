import MainLayout from "@/components/layout/MainLayout";
import SettingsLayout from "@/components/layout/SettingsLayout";
import { type NextPageWithLayout } from "../_app";

const PasswordPage: NextPageWithLayout = () => <div>Password</div>;

PasswordPage.getLayout = (page) => (
  <MainLayout>
    <SettingsLayout>{page}</SettingsLayout>
  </MainLayout>
);

export default PasswordPage;
