"use client";
import { Button } from "@/components/ui/button";
import {
	FileInput,
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
	type UploadedFile,
} from "@/components/ui/file-upload";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import clsx from "clsx";
import { CloudUpload, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { toast } from "sonner";
import * as z from "zod";
import type { ApiFormData } from "../lib/api";

const formSchema = z
	.object({
		name: z.string().min(1),
		email: z.string().min(1),
		accountNumber: z.string().optional(),
		cardNumber: z.string().optional(),
		amount: z.string().refine((val) => !Number.isNaN(Number(val)), {
			message: "Beløp må være et tall",
		}),
		responsibleCommittee: z.string(),
		intent: z.string().min(1),
		comments: z.string(),
		attachments: z.array(z.string()).refine((val) => val.length > 0, {
			message: "Må laste opp minst en fil",
		}),
	})
	.refine(
		(data) => {
			if (data.accountNumber && data.cardNumber) {
				return false;
			}
			return true;
		},
		{
			message: "Kan ikke ha både kontonr og kortnr",
			path: ["cardNumber"],
		},
	);

type FormData = z.infer<typeof formSchema>;

const GROUPS = [
	"Applikasjonskomiteen",
	"Arrangementskomiteen",
	"Backlog",
	"Bank- og økonomikomiteen",
	"Bedriftskomiteen",
	"Debug",
	"Drifts- og Utviklingskomiteen",
	"Ekskursjonskomiteen",
	"Fag- og kurskomiteen",
	"Females in IT",
	"Hovedstyret",
	"IT-Ekskursjonen",
	"Jubileumskomiteen",
	"Karrieredagene",
	"Komitéledere",
	"Online Idrettslag",
	"Onlines Fond",
	"Pangsjonistkomiteen",
	"Profil- og aviskomiteen",
	"Redaksjonen",
	"Tech Talks",
	"Trivselskomiteen",
	"Velkomstkomiteen",
	"X-Sport",
	"Onlinepotten",
];

function formIsEmpty(values: z.infer<typeof formSchema>) {
	return (
		values.name === "" &&
		values.email === "" &&
		values.amount === undefined &&
		values.intent === "" &&
		values.comments === "" &&
		values.attachments.length === 0
	);
}

export default function ReceiptForm() {
	const isTestMode = window.location.pathname.includes("test");

	useEffect(() => {
		if (!isTestMode) {
			return;
		}

		localStorage.setItem("storageKey", "");

		const testData: FormData = {
			email: "test@test.com",
			name: "test",
			cardNumber: undefined,
			accountNumber: "1234567890",
			amount: "100",
			responsibleCommittee: "Hovedstyret",
			intent: "test",
			comments: "test",
			attachments: [testFile.url],
		};

		form.setValue("email", testData.email);
		form.setValue("name", testData.name);
		form.setValue("cardNumber", testData.cardNumber);
		form.setValue("accountNumber", testData.accountNumber);
		form.setValue("amount", testData.amount);
		form.setValue("responsibleCommittee", testData.responsibleCommittee);
		form.setValue("intent", testData.intent);
		form.setValue("comments", testData.comments);
		form.setValue("attachments", testData.attachments);
	}, [isTestMode]);

	const testFile: UploadedFile = {
		file: new File(["test content"], "bilde.png", { type: "image/png" }),
		url: "https://s3.eu-north-1.amazonaws.com/receipt-archive.online.ntnu.no/bilde.png",
	};

	const [files, setFiles] = useState<UploadedFile[] | null>(
		isTestMode ? [testFile] : null,
	);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	const dropZoneConfig = {
		maxFiles: 20,
		maxSize: 1024 * 1024 * 50,
		multiple: true,
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	useFormPersist("storageKey", {
		watch: form.watch,
		setValue: form.setValue,
		storage: window.localStorage,
		exclude: ["amount", "intent", "comments", "attachments"],
	});

	async function generatePdf(formData: ApiFormData) {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/generate_pdf`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					form_data: formData,
					route: "generate_pdf",
				}),
			},
		);

		if (response.status !== 200) {
			throw new Error("Feil ved generering av PDF");
		}

		const data = await response.json();

		return data.data.pdf_url;
	}

	async function sendEmail(pdfUrl: string, formData: ApiFormData) {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/send_email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				pdf_url: pdfUrl,
				form_data: formData,
				test_mode: isTestMode ? "true" : "false",
			}),
		});

		await response.json();

		if (response.status !== 200) {
			throw new Error("Feil ved sending av email");
		}
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log("onSubmit", values);
		try {
			const formData: ApiFormData = {
				full_name: values.name,
				email: values.email,
				committee: values.responsibleCommittee,
				type: values.cardNumber ? "card" : "account",
				card_number: values.cardNumber || "",
				account: values.accountNumber || "",
				amount: Number(values.amount),
				intent: values.intent,
				comments: values.comments,
				attachments: values.attachments.map((url) => ({
					url,
					mime_type: files?.find((file) => file.url === url)?.file.type ?? "",
				})),
				// biome-ignore lint: Will never be undefined
				start_time: new Date(window.sessionStorage.getItem("startTime")!),
			};

			const pdfUrlPromise = toast.promise(generatePdf(formData), {
				loading: "Genererer PDF...",
				success: "PDF generert",
				error: "Feil ved generering av PDF",
			});

			const pdfUrl = await pdfUrlPromise.unwrap();
			console.log("pdfUrl", pdfUrl);
			setPdfUrl(pdfUrl);

			const emailPromise = toast.promise(sendEmail(pdfUrl, formData), {
				loading: "Sender email til Bankkom...",
				success: "Email sendt til Bankkom",
				error: "Feil ved sending av email",
			});

			console.log("emailPromise", emailPromise);
			await emailPromise.unwrap();
		} catch (error) {
			Sentry.captureMessage("An error ocurred in onSubmit", "error");
		}
	}

	const oldStartTime = window.sessionStorage.getItem("startTime");
	const currentSessionTime = oldStartTime ? new Date(oldStartTime) : new Date();
	window.sessionStorage.setItem("startTime", currentSessionTime.toISOString());

	return (
		<div className="space-y-8 max-w-3xl mx-auto py-10">
			{isTestMode && <h3>Test mode</h3>}
			<Button
				variant="outline"
				className={clsx(
					"mx-auto",
					formIsEmpty(form.getValues()) ? "hidden" : "",
				)}
				onClick={() => {
					form.setValue("name", "");
					form.setValue("email", "");
					form.setValue("amount", "");
					form.setValue("intent", "");
					form.setValue("comments", "");
					form.setValue("accountNumber", "");
					form.setValue("cardNumber", "");
					form.setValue("responsibleCommittee", "");
					form.setValue("attachments", []);
					setFiles(null);
					setPdfUrl(null);
				}}
			>
				Tøm skjema
			</Button>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit, (errors) => {
						console.error("Form validation errors:", errors);
					})}
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Navn</FormLabel>
									<FormControl>
										<Input
											placeholder="Ditt fulle navn"
											type="text"
											value={field.value}
											onChange={(e) => {
												field.onChange(e.target.value);
												form.setValue("name", e.target.value);
											}}
										/>
									</FormControl>
									<FormDescription>Skriv inn ditt fulle navn</FormDescription>
									<FormMessage />
								</FormItem>
							);
						}}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-post</FormLabel>
								<FormControl>
									<Input
										placeholder="din.epost@online.ntnu.no"
										type="email"
										{...field}
										value={field.value}
										onChange={(e) => {
											field.onChange(e.target.value);
											form.setValue("email", e.target.value);
										}}
									/>
								</FormControl>
								<FormDescription>Online-mail hvis du har</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 rounded-lg">
						<div className="col-span-12 text-sm text-gray-500">
							Kun en av disse skal fylles ut. Hvis du har betalt for noe med ett
							av Online sine kort, fyll ut til høyre. Hvis du har lagt ut
							privat, fyll inn kontonr i input til venstre. kontonr som pengene
							skal gå til.
						</div>

						<div className="col-span-6">
							<FormField
								control={form.control}
								name="accountNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Kontonr</FormLabel>
										<FormControl>
											<Input
												placeholder="F.eks. 1234 56 78901"
												type="string"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Kontonummer for refusjon av utlegg
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="col-span-6">
							<FormField
								control={form.control}
								name="cardNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Kortnr</FormLabel>
										<FormControl>
											<Input
												placeholder="Kortnummer/hvilken komite kortet tilhører"
												type="string"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Kortnummer hvis du brukte komiteens kort
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Beløp</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Beløp i NOK" type="string" />
								</FormControl>
								<FormDescription>Totalbeløp for kvitteringen</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="responsibleCommittee"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Ansvarlig enhet</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Velg komité eller gruppe" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{GROUPS.map((group) => (
											<SelectItem key={group} value={group}>
												{group}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Velg hvilken komité eller gruppe utgiften tilhører
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="intent"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Anledning</FormLabel>
								<FormControl>
									<Input
										placeholder="F.eks. Komitémøte, arrangement, innkjøp"
										type="text"
										{...field}
									/>
								</FormControl>
								<FormDescription>Grunnlaget for kjøpet</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="comments"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Kommentarer</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Legg til eventuelle kommentarer eller forklaringer her"
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Tilleggsinformasjon om utgiften hvis nødvendig
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="attachments"
						render={() => (
							<FormItem>
								<FormLabel>Last opp kvittering</FormLabel>
								<FormControl>
									<FileUploader
										value={files}
										onValueChange={(files) => {
											setFiles(files);
											form.setValue(
												"attachments",
												files?.map((file) => file.url) ?? [],
											);
										}}
										dropzoneOptions={dropZoneConfig}
										className="relative bg-background rounded-lg p-2"
									>
										<FileInput
											id="fileInput"
											className="outline-dashed outline-1 outline-slate-500"
										>
											<div className="flex items-center justify-center flex-col p-8 w-full ">
												<CloudUpload className="text-gray-500 w-10 h-10" />
												<p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
													<span className="font-semibold">
														Klikk for å laste opp
													</span>
													&nbsp; eller dra og slipp
												</p>
											</div>
										</FileInput>
										<FileUploaderContent>
											{files &&
												files.length > 0 &&
												files.map((_, i) => (
													// biome-ignore lint: test
													<FileUploaderItem key={i} index={i}>
														<Paperclip className="h-4 w-4 stroke-current" />
														<span>fil-{i + 1}</span>
													</FileUploaderItem>
												))}
										</FileUploaderContent>
									</FileUploader>
								</FormControl>
								<FormDescription>
									Du kan laste opp rett fra iphone
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					{pdfUrl && (
						<div>
							<div>Pdf sendt til Bankkom:</div>
							<a
								href={pdfUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="block text-sm text-blue-500 truncate hover:underline"
							>
								Åpne PDF-kvittering
							</a>
						</div>
					)}
					<Button type="submit">Send til Bankkom</Button>
				</form>
			</Form>
		</div>
	);
}
