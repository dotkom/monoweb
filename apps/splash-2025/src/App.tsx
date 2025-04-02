import { Debug_info } from "./components/debug_info";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { SponsorPlaceholderIcon } from "./components/icons";
import { Linjeforening_info } from "./components/linjeforening_info";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen">
			<Header />

			<main>
				<Hero />
				<Debug_info />
				<Linjeforening_info />
			</main>

			<Footer sponsorLogo={<SponsorPlaceholderIcon />} />
		</div>
	);
}

export default App;
