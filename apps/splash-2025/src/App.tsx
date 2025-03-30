import { QueryClientProvider } from "@tanstack/react-query";
import { Cloud } from "./components/cloud";
import { Events } from "./components/events";
import { Header } from "./components/header";
import { queryClient } from "./lib/trpc";

function App() {
	return (
		<div className="bg-[#6B1414] min-h-screen bg-[url(/public/bakgrunnsBilde.jpg)] bg-no-repeat bg-cover bg-center">
			<Header />

			<main>
				Team onboarding ftw 1
				<Cloud />
				<QueryClientProvider client={queryClient}>
					<Events />
				</QueryClientProvider>
			</main>
		</div>
	);
}

export default App;
