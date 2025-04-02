import type { ReactNode } from "react";
import { FooterWave } from "./icons";
import { SoMeLinks } from "./someLinks";

export const Footer = ({ sponsorLogo }: { sponsorLogo?: ReactNode }) => {
	return (
		<footer className="text-white">
			<div className="overflow-hidden">
				<FooterWave color="#C1842E" className="size-[135%]" />
			</div>
			<div className="bg-[#C1842E] flex flex-col items-center pb-4">
				<h5 className="text-4xl m-3 mt-0">Har du noen spørsmål?</h5>
				<p className="text-xl text-center mx-4">
					Dersom du lurer på noe, ikke nøl med å ta kontakt! Du kan nå oss på{" "}
					<a href="mailto:kontakt@online.ntnu.no" className="underline">
						kontakt@online.ntnu.no
					</a>
				</p>
				<SoMeLinks />
			</div>

			{sponsorLogo && (
				<div className="overflow-hidden">
					<div className="bg-[#C1842E] ">
						<FooterWave
							color="#F9B759"
							className="h-[100%] w-[135%] relative left-[-30%]"
						/>
					</div>
					<div className="bg-[#F9B759] flex justify-center p-10">
						{sponsorLogo}
					</div>
				</div>
			)}
		</footer>
	);
};
