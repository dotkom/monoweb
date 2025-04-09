export function alertFormSubmission(message: string) {
	fetch(import.meta.env.VITE_SLACK_ALERT_WEBHOOK_URL, {
		method: "POST",
		body: JSON.stringify({ text: message }),
	});
}
