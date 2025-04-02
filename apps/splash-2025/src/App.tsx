import { Debug_info } from "./components/debug_info";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Linjeforening_info } from "./components/linjeforening_info";
import { SponsorPlaceholderIcon } from "./components/icons";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen">
			<div className="bg-[url(/bakgrunnsBilde.jpg)] h-screen bg-no-repeat bg-cover bg-center" />
			<Header />

			<main>
				<Debug_info />
				<Linjeforening_info />
			</main>

			<Footer sponsorLogo={<SponsorPlaceholderIcon />} />
		</div>
	);
}

export default App;
