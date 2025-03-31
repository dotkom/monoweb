import { Cloud } from "./components/cloud";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { SponsorPlaceholderIcon } from "./components/icons";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen bg-[url(/public/bakgrunnsBilde.jpg)] bg-no-repeat bg-cover bg-center">
			<Header />

			<main>
				<Cloud />
			</main>

			<Footer sponsorLogo={<SponsorPlaceholderIcon />} />
		</div>
	);
}

export default App;
