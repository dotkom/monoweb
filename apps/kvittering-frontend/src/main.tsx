import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import * as Sentry from "@sentry/react";

const IS_PRODUCTION = import.meta.env.MODE === "production";

Sentry.init({
	dsn: IS_PRODUCTION
		? import.meta.env.VITE_SENTRY_DSN
		: undefined,
	integrations: [
		Sentry.replayIntegration({
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
