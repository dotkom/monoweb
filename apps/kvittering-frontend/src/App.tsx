import { Toaster } from "sonner";
import { Header } from "./components/header";
import ReceiptForm from "./components/receipt-form";

function App() {
	return (
		<div>
			<Header />
			<main className="px-8 lg:px-0">
				<ReceiptForm />
			</main>
			<Toaster />
		</div>
	);
}

export default App;
