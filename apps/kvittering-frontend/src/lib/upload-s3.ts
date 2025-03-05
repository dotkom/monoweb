const LAMBDA_ENDPOINT =
	"https://6jwalrhrza.execute-api.eu-north-1.amazonaws.com";

export const uploadFileToS3 = async (file: File) => {
	const body = {
		route: "presigned_post",
		key: `${file.name}`,
		mime_type: file.type,
	};

	const resp = await fetch(LAMBDA_ENDPOINT, {
		method: "POST",
		body: JSON.stringify(body),
	});

	const response = await resp.json();

	const presignedPost = response.data;

	const url = await uploadFileToS3PresignedUrl(
		file,
		presignedPost.fields,
		presignedPost.url,
	);

	return url;
};

// content-type: image/png
// bucket: cdn.online.ntnu.no
// X-Amz-Algorithm: AWS4-HMAC-SHA256
// X-Amz-Credential: ASIA47DY455ORDBXFQ4C/20250304/eu-north-1/s3/aws4_request
// X-Amz-Date: 20250304T141324Z
// X-Amz-Security-Token: IQoJb3JpZ2luX2VjELb//////////wEaCWV1LXdlc3QtMSJIMEYCIQCBaGtdEMGMeWaCfGtQSkEb2CsqoUJuWS1xHhaErgUfyAIhAONc/5fZ3WTAFeWp8w+garuOiE3qQtdbk9K4htPwt1OGKqkDCO///////////wEQBBoMODkxNDU5MjY4NDQ1IgxQQKskxfRah4f5x0kq/QK9aV4bbCRA7cfN1aOEkNyckOzDKgSYmkLFMQ7TSf/CySYsya8aJKuTNyDN358wt1hB9kr72VPAPzp0pD2VLt5lU1CP8qW7vVO7RH0nGuOIYEzBYFpFRLDsTQD9JiuoJhN/gGZA85FqzytasDJr2HXjmc0BHHJlvFxHJwqvBENNjSHUWVCVODQUk1RnIsO4BbP4jPAPuAFv6a2N2s0tIw/n4jtQCXCJxbWi/HH3s6VfmS8uN4sZlTgDnMrp4pSQgKLd5i0UPaPy9AqEw5fW6NsmT1/Vp+NelIvX6BmYYAJ2i9Bj01ybarnwUA7F00D14JV8DvhTloW8UKhY6Ln6G5qbqoYb6TQCt60r6UY42NiFhH0FuACHDXyLBAkB1x80App927xbEOU/hABXXE16r9oJEW0f4eXP4F7PvK5Mqwyufq292GJ2/Gj10JKrKOgkhxmf6VIh9oZ0bPNrGHVdcduzfBP4hlX/TMO3tJYg0ZSFfsu8Q4lP31USQlEQvH8wyJOcvgY6pQH90VgzcoalAdbS35iez8SzmakhNty/N/kuUaiQ1DOXGRZKPsXmDEbq/REY6pPMeO1BKRRAxf2bDBuj6byUZVZiJrjMqiTq1CT+G/vOeJbnjyw7ZK41MlSXpHyf4YrF2BYqDUmRB5hEgXP8EgLnZcnLdPD7hrw5vTXp7s6t9/nxEUG9odHSRrJKiKrHmSIUhpI+egjT0WDubEZp234kcpny4bVfqpE=
// key: 1741097604906-990d8f9e-5122-4d6f-964d-8d59d338ad0d-bilde.png
// Policy: eyJleHBpcmF0aW9uIjoiMjAyNS0wMy0wNFQxNToxMzoyNFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwyNjIxNDQwMF0seyJjb250ZW50LXR5cGUiOiJpbWFnZS9wbmcifSx7ImJ1Y2tldCI6ImNkbi5vbmxpbmUubnRudS5ubyJ9LHsiWC1BbXotQWxnb3JpdGhtIjoiQVdTNC1ITUFDLVNIQTI1NiJ9LHsiWC1BbXotQ3JlZGVudGlhbCI6IkFTSUE0N0RZNDU1T1JEQlhGUTRDLzIwMjUwMzA0L2V1LW5vcnRoLTEvczMvYXdzNF9yZXF1ZXN0In0seyJYLUFtei1EYXRlIjoiMjAyNTAzMDRUMTQxMzI0WiJ9LHsiWC1BbXotU2VjdXJpdHktVG9rZW4iOiJJUW9KYjNKcFoybHVYMlZqRUxiLy8vLy8vLy8vL3dFYUNXVjFMWGRsYzNRdE1TSklNRVlDSVFDQmFHdGRFTUdNZVdhQ2ZHdFFTa0ViMkNzcW9VSnVXUzF4SGhhRXJnVWZ5QUloQU9OYy81ZlozV1RBRmVXcDh3K2dhcnVPaUUzcVF0ZGJrOUs0aHRQd3QxT0dLcWtEQ08vLy8vLy8vLy8vL3dFUUJCb01PRGt4TkRVNU1qWTRORFExSWd4UVFLc2t4ZlJhaDRmNXgwa3EvUUs5YVY0YmJDUkE3Y2ZOMWFPRWtOeWNrT3pES2dTWW1rTEZNUTdUU2YvQ3lTWXN5YThhSkt1VE55RE4zNTh3dDFoQjlrcjcyVlBBUHpwMHBEMlZMdDVsVTFDUDhxVzd2Vk83Ukgwbkd1T0lZRXpCWUZwRlJMRHNUUUQ5Sml1b0poTi9nR1pBODVGcXp5dGFzREpyMkhYam1jMEJISEpsdkZ4SEp3cXZCRU5OalNIVVdWQ1ZPRFFVazFSbklzTzRCYlA0alBBUHVBRnY2YTJOMnMwdEl3L240anRRQ1hDSnhiV2kvSEgzczZWZm1TOHVONHNabFRnRG5NcnA0cFNRZ0tMZDVpMFVQYVB5OUFxRXc1Zlc2TnNtVDEvVnArTmVsSXZYNkJtWVlBSjJpOUJqMDF5YmFybndVQTdGMDBEMTRKVjhEdmhUbG9XOFVLaFk2TG42RzVxYnFvWWI2VFFDdDYwcjZVWTQyTmlGaEgwRnVBQ0hEWHlMQkFrQjF4ODBBcHA5Mjd4YkVPVS9oQUJYWEUxNnI5b0pFVzBmNGVYUDRGN1B2SzVNcXd5dWZxMjkyR0oyL0dqMTBKS3JLT2draHhtZjZWSWg5b1owYlBOckdIVmRjZHV6ZkJQNGhsWC9UTU8zdEpZZzBaU0Zmc3U4UTRsUDMxVVNRbEVRdkg4d3lKT2N2Z1k2cFFIOTBWZ3pjb2FsQWRiUzM1aWV6OFN6bWFraE50eS9OL2t1VWFpUTFET1hHUlpLUHNYbURFYnEvUkVZNnBQTWVPMUJLUlJBeGYyYkRCdWo2YnlVWlZaaUpyak1xaVRxMUNUK0cvdk9lSmJuanl3N1pLNDFNbFNYcEh5ZjRZckYyQllxRFVtUkI1aEVnWFA4RWdMblpjbkxkUEQ3aHJ3NXZUWHA3czZ0OS9ueEVVRzlvZEhTUnJKS2lLckhtU0lVaHBJK2VnalQwV0R1YkVacDIzNGtjcG55NGJWZnFwRT0ifSx7ImtleSI6IjE3NDEwOTc2MDQ5MDYtOTkwZDhmOWUtNTEyMi00ZDZmLTk2NGQtOGQ1OWQzMzhhZDBkLWJpbGRlLnBuZyJ9XX0=
// X-Amz-Signature: 9bd46e012855aa97ac70230629b91fb4e41819c7ab06e6abd3fb9528e76affc6
// file: (binary)

async function uploadFileToS3PresignedUrl(
	file: File,
	fields: Record<string, string>,
	url: string,
): Promise<string> {
	try {
		const formData = new FormData();
		for (const [key, value] of Object.entries(fields)) {
			formData.append(key, value);
		}

		formData.append("Content-Type", file.type);
		formData.append("file", file);

		const response = await fetch(url, {
			method: "POST",
			body: formData,
		});

		for (const [key, value] of Object.entries(response.headers)) {
			console.log(key, value);
		}

		// S3 returns a Location header with the url of the uploaded file
		const location = response.headers.get("Location");
		if (!location) {
			throw new Error("File upload failed: No location header");
		}

		return location;
	} catch (e) {
		throw new Error(`File upload failed: ${e}`);
	}
}
