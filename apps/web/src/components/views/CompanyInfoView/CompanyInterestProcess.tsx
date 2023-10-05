import { Circle } from "@dotkomonline/ui/";
import { type FC } from "react";

interface CompanyInterestProcessProps {
    steps: Array<string>;
}

const CompanyInterestProcess: FC<CompanyInterestProcessProps> = ({ steps }) => (
    <div className="mx-auto grid max-w-[1024px] grid-cols-1 px-3 py-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
            <div className="mb-1 flex flex-col items-center py-3" key={step}>
                <Circle color="bg-blue-3" size={700 / 15}>
                    {index + 1}
                </Circle>
                <p>{step}</p>
            </div>
        ))}
    </div>
);

export default CompanyInterestProcess;
