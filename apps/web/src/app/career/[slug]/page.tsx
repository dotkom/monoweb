import { fetchCareerAd } from "@/api/get-career-ads";
import { CareerAdView } from "@/components/views/CareerAdView";

const CareerAdPage = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const career = await fetchCareerAd(slug);
  if (!career) {
    return <div>404 - Sanity not found</div>;
  }
  return <CareerAdView career={career} />;
};

export default CareerAdPage;
