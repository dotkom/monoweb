import MainLayout from "@/components/layout/MainLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

import { type NextPageWithLayout } from "../_app";

const PenaltiesPage: NextPageWithLayout = () => <div>Penalties</div>;

PenaltiesPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
);

export default PenaltiesPage;
