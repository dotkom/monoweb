import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

import { type NextPageWithLayout } from "../_app";

const MembershipPage: NextPageWithLayout = () => <div>Membership</div>;

MembershipPage.getLayout = (page) => (
    <MainLayout>
        <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
);

export default MembershipPage;
