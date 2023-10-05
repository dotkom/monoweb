import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

import { type NextPageWithLayout } from "../_app";

const PrivacyPage: NextPageWithLayout = () => <div>Privacy</div>;

PrivacyPage.getLayout = (page) => (
    <MainLayout>
        <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
);

export default PrivacyPage;
