import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import * as Sentry from "@sentry/react";

// Initialize Sentry before doing anything else
console.log("Initializing Sentry");
Sentry.init({
	dsn: "https://ce333be780ecceb0975d83342bacedba@o93837.ingest.us.sentry.io/4508931842048000",
	integrations: [
		Sentry.replayIntegration({
			maskAllText: false,
			blockAllMedia: false,
			unblock: [".sentry-unblock, [data-sentry-unblock]"],
			unmask: [".sentry-unmask, [data-sentry-unmask]"],
			onError: (event) => {
				console.log("Sentry error", event);
			},
		}),
	],
	// Session Replay
	replaysSessionSampleRate: 1.0,
	replaysOnErrorSampleRate: 1.0,
	sampleRate: 1.0,
	tracesSampleRate: 1.0,
	profilesSampleRate: 1.0,
});
console.log("Sentry initialized");

// Get root element after Sentry is initialized
const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element not found");
}

// Render the app
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
