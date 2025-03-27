export const Header = () => {
	return (
		<header className="w-full sticky top-0 text-white p-10 flex justify-center">
			<a
				href="https://online.ntnu.no"
				className="absolute mx-[5%] top-0 left-0 group"
			>
				<div className="bg-brand items-center py-6 pt-1 flex flex-col text-center font-bold">
					<img
						src="/Online_hvit_o.svg"
						alt="Online logo"
						className="size-10 m-5"
					/>
					<p className="group-hover:scale-[1.15] transition-all duration-500">
						Gå til
						<br />
						hovedsiden
					</p>
				</div>
				<div className="border-b-[2.5rem] border-b-transparent border-x-[4rem] border-x-brand" />
			</a>

			<div className="flex justify-center gap-20 text-2xl font-light pt-6 px-[5%] border-t-2 border-white max-md:opacity-0">
				<a
					href="#program"
					className="hover:scale-[1.15] transition-all duration-500"
				>
					Program
				</a>
				<a
					href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
					target="_blank"
					className="hover:scale-[1.15] transition-all duration-500"
					rel="noreferrer"
				>
					Ta kontakt
				</a>
				<a
					href="https://opptak.online.ntnu.no"
					target="_blank"
					className="hover:scale-[1.15] transition-all duration-500"
					rel="noreferrer"
				>
					Søk komité
				</a>
			</div>
		</header>
	);
};
