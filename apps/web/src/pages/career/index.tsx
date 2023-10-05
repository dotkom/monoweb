import { type CareerAd, fetchCareerAds } from "@/api/get-career-ads";
import CareerView from "@/components/views/CareerView";
import { type GetServerSideProps } from "next";
import { type FC } from "react";

export interface CareerProps {
    careers: Array<CareerAd>;
}

export const getServerSideProps: GetServerSideProps = async () => {
    const data = await fetchCareerAds();

    return { props: { careers: data } };
};

const Career: FC<CareerProps> = (props: CareerProps) => <CareerView careers={props.careers} />;
// return <div>404 - Sanity not found</div>

export default Career;
