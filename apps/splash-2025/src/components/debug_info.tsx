export const Debug_info = () => {
	return (
		<div>
			<div className="relative mt-20 md:mt-60">
				<img
					src="/Online_bla_o.svg"
					alt="Online logo"
					className="absolute left-[68%] top-[40%] transform -translate-x-1/2 z-10 w-20 xl:w-60 lg:w-48 md:w-40"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1440 319"
					className="relative w-full"
				>
					<title>Debug Info</title>
					<path
						fill="white"
						fill-opacity="1"
						d="M0,192L48,165.3C96,139,192,85,288,85.3C384,85,480,139,576,
                        138.7C672,139,768,85,864,58.7C960,32,1056,32,1152,69.3C1248,
                        107,1344,181,1392,218.7L1440,256L1440,320L1392,320C1344,320,1248,
                        320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,
                        320,384,320,288,320C192,320,96,320,48,320L0,320Z"
					/>
				</svg>
			</div>
			<div className="relative bg-[#FFFF] p-4 md:p-10 flex flex-col text-left md:px-20 max-sm: px-10">
				<h1 className="text-xl font-bold md:text-2xl m-6 md:m-4">
					Har du opplevd noe ugreit?
				</h1>
				<p className="mb-4 md:mb-10 text-base md:text-2xl">
					Online har et eget uavhengig organ for varslingssaker som kan hjelpe
					med alt. Vi ønsker at alle skal ha det bra og føle seg trygge. Derfor
					håper vi at du tar kontakt dersom du har opplevd noe ubehagelig under
					fadderukene. Ser du at noen andre opplever noe ubehagelig er det
					viktig å huske på at du også har et ansvar for å si ifra. Vi tar imot
					alt, og om du er i tvil er det bare å sende oss en melding. Tar du
					kontakt med oss vil all informasjon behandles strengt konfidensielt.
					Vi kan bistå med alt fra en uformell prat til å hjelpe deg med å
					oppsøke profesjonell hjelp eller rådgivning.
				</p>
				<div className="flex flex-row justify-center items-center">
					<button
						type="button"
						className="bg-[#2D5A77] text-white px-6 md:px-14 py-4 md:py-10 rounded-xl md:rounded-2xl hover:bg-[#234761] transition-colors m-2 md:m-7 text-base md:text-2xl"
					>
						Ta kontakt her
					</button>
				</div>
			</div>
			<div className="bg-brand">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<title>Debug Info</title>
					<path fill="white" fill-opacity="1" d="M0,32L1440,0L1440,0L0,0Z" />
					
				</svg>
			</div>
		</div>
	);
};
