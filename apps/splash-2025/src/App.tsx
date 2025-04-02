import { Debug_info } from "./components/debug_info";
import { Header } from "./components/header";
import { Linjeforening_info } from "./components/linjeforening_info";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen">
			<div className="bg-[url(/bakgrunnsBilde.jpg)] h-screen bg-no-repeat bg-cover bg-center" />
			<Header />

			<main>
				Team onboarding ftw 1
				<Debug_info />
				<Linjeforening_info />
			</main>
		</div>
	);
}

export default App;
