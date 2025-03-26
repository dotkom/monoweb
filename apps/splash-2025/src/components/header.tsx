export const Header = () => {
	return (
		<header className="w-full sticky text-white p-10 flex justify-center">
			<a href="https://online.ntnu.no" className="absolute mx-12 top-0 left-0">
				<div className="bg-brand items-center p-5 flex flex-col gap-3 text-center font-bold">
					<img src="/Online_hvit_o.svg" alt="Online logo" className="size-10" />
					Gå til
					<br />
					hovedsiden
				</div>
				<div className="border-b-[2rem] border-b-transparent border-x-[4rem] border-x-brand" />
			</a>

			<div className="flex justify-center gap-14 text-2xl pt-6 px-14 border-t-[3px] border-white">
				<a href="#program" className="">
					Program
				</a>
				<a href="https://online.ntnu.no" className="">
					Ta kontakt
				</a>
				<a href="https://online.ntnu.no" className="">
					Søk komite
				</a>
			</div>
		</header>
	);
};
