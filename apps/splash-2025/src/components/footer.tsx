import type { ReactNode } from "react";
import { SoMeLinks } from "./someLinks";

export const Footer = ({ sponsorLogo }: { sponsorLogo?: ReactNode }) => {
	return (
		<footer className="text-white">
			<div className="bg-[#C1842E] flex flex-col items-center p-4">
				<h5 className="text-2xl m-3">Har du noen spørsmål?</h5>
				<p>
					Dersom du lurer på noe, ikke nøl med å ta kontakt! Du kan nå oss på{" "}
					<a href="mailto:kontakt@online.ntnu.no" className="underline">
						kontakt@online.ntnu.no
					</a>
				</p>
				<SoMeLinks />
			</div>

			{sponsorLogo && (
				<div className="bg-[#F9B759] flex justify-center p-4">
					{sponsorLogo}
				</div>
			)}
		</footer>
	);
};
