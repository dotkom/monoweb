import { fetchCareerAds } from "@/api/get-career-ads";
import CareerView from "@/components/views/CareerView";

const Career = async () => {
  return <CareerView careers={await fetchCareerAds()} />;
};

export default Career;
