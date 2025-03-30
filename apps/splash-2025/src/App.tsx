import { Cloud } from "./components/cloud";
import { Header } from "./components/header";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen bg-[url(/public/bakgrunnsBilde.jpg)] bg-no-repeat bg-cover bg-center">
			<Header />

			<main>
				Team onboarding ftw 1
				<Cloud />
			</main>
		</div>
	);
}

export default App;
