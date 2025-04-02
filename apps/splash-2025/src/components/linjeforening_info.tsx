export const Linjeforening_info = () => {
	return (
		<div>
			<div className="relative text-white p-4 md:p-10 flex flex-col text-left md:px-20 max-sm: px-10">
				<h2 className="text-xl md:text-2xl font-bold my-6 md:my-4">
					{" "}
					Bli aktiv i linjeforeningen!
				</h2>
				<p className="mb-4 md:mb-10 text-base md:text-2xl">
					Online er linjeforeningen for alle som studerer informatikk. Gå videre
					til{" "}
					<a href="https://online.ntnu.no/" className="underline text-accent-9">
						hovednettsiden
					</a>{" "}
					for å lage brukerkonto og bli medlem.
					<br />
					Er det noe du lurer på om linjeforeningen Online? En kjapp innføring i
					dette kan du finne på{" "}
					<a
						href="https://wiki.online.ntnu.no/info/sosialt-og-okonomisk/ditt-liv-som-onliner/"
						className="underline text-accent-9"
					>
						wikien
					</a>
					.
					<br />
					Har du lyst til å gjøre studietiden enda bedre? Som komitemedlem i
					Online blir du del av en familie du aldri vil glemme. Vi tilbyr
					utfordrende og spennende verv i et meget sosialt miljø med stor
					takhøyde.
					<br />
					Les mer om de ulike komiteene og send inn din søknad på opptakssiden
					vår i lenken under.
				</p>
			</div>
			<div className="flex flex-row justify-center items-center mb-80">
				<button
					type="button"
					className=" border border-white text-white px-6 
                                    md:px-14 py-4 md:py-10 rounded-xl md:rounded-2xl 
                                    hover:-translate-y-[1px] hover:border-accent-9 
                                    active:translate-y-[2px] transition-all m-2 
                                    md:m-7 text-base md:text-2xl "
				>
					Gå til opptakssiden
				</button>
			</div>
		</div>
	);
};
