import * as pdfjsLib from "pdfjs-dist";
// Directly import the PDF.js worker

import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

/**
 * Converts the first page of a PDF file to an image (JPEG)
 * Uses PDF.js to render the PDF to a canvas and then convert to an image blob
 *
 * @param pdfFile - The PDF file to convert
 * @returns A Promise that resolves to a Blob containing the image
 */
export async function convertPdfToImage(pdfFile: File): Promise<Blob> {
	try {
		// Read the PDF file
		const arrayBuffer = await pdfFile.arrayBuffer();
		const pdfData = new Uint8Array(arrayBuffer);

		// Load the PDF document
		const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

		// Get the first page
		const page = await pdfDoc.getPage(1);

		// Create a canvas to render the PDF page
		const viewport = page.getViewport({ scale: 1.5 });
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		if (!context) {
			throw new Error("Canvas context could not be created");
		}

		// Set canvas dimensions to match the page viewport
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		// Render the PDF page to the canvas
		const renderContext = {
			canvasContext: context,
			viewport: viewport,
		};

		await page.render(renderContext).promise;

		// Convert the canvas to a blob
		return new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Failed to convert canvas to blob"));
					}
				},
				"image/jpeg",
				0.9,
			); // 0.9 quality, high but with some compression
		});
	} catch (error) {
		console.error("Error converting PDF to image:", error);
		throw error;
	}
}
