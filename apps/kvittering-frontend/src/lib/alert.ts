// curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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

const slackWebhookUrl =
	"https://hooks.slack.com/services/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";

export function alertFormSubmission(message: string) {
	fetch(slackWebhookUrl, {
		method: "POST",
		body: JSON.stringify({ text: message }),
	});
}
