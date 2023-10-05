import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

import { type NextPageWithLayout } from "../_app";

const AccessCardPage: NextPageWithLayout = () => <div>Access card</div>;

AccessCardPage.getLayout = (page) => (
    <MainLayout>
        <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
);

export default AccessCardPage;
