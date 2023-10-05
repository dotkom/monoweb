import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { type NextPageWithLayout } from "../_app";

const EmailPage: NextPageWithLayout = () => <div>Email</div>;

EmailPage.getLayout = (page) => (
    <MainLayout>
        <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
);

export default EmailPage;
