export interface ApiFormData {
	full_name: string;
	email: string;
	committee: string;
	type: string;
	card_number: string;
	account: string;
	amount: number;
	intent: string;
	comments: string;
	attachments: {
		url: string;
		mime_type: string;
	}[];
	start_time: Date;
}
