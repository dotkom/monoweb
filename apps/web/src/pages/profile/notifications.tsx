import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

import { type NextPageWithLayout } from "../_app";

const NotifcationPage: NextPageWithLayout = () => <div>Notification</div>;

NotifcationPage.getLayout = (page) => (
    <MainLayout>
        <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
);

export default NotifcationPage;
