import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

export interface PdfToLongImageOptions {
	onProgress?: (percent: number) => void;
}

export async function convertPdfToLongImage(
	pdfFile: File,
	pages?: number | number[] | null,
	options: PdfToLongImageOptions = {},
): Promise<Blob> {
	try {
		const { onProgress } = options;
		const scale = 3.0;

		const arrayBuffer = await pdfFile.arrayBuffer();
		const pdfData = new Uint8Array(arrayBuffer);
		const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
		const numPages = pdfDoc.numPages;

		let pagesToRender: number[] = [];

		if (pages === undefined || pages === null) {
			pagesToRender = Array.from({ length: numPages }, (_, i) => i + 1);
		} else if (typeof pages === "number") {
			if (pages < 1 || pages > numPages) {
				throw new Error(`Page ${pages} is out of range (1-${numPages})`);
			}
			pagesToRender = [pages];
		} else {
			pagesToRender = pages.filter((p) => p >= 1 && p <= numPages);
			if (pagesToRender.length === 0) {
				throw new Error("No valid pages specified");
			}
		}

		const pageCanvases: {
			canvas: HTMLCanvasElement;
			height: number;
			width: number;
		}[] = [];
		let totalHeight = 0;
		let maxWidth = 0;

		for (let i = 0; i < pagesToRender.length; i++) {
			const pageNum = pagesToRender[i];
			const page = await pdfDoc.getPage(pageNum);

			const viewport = page.getViewport({ scale });
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d", { alpha: false });

			if (!context) {
				throw new Error("Canvas context could not be created");
			}

			canvas.height = viewport.height;
			canvas.width = viewport.width;

			await page.render({
				canvasContext: context,
				viewport: viewport,
			}).promise;

			pageCanvases.push({
				canvas,
				height: canvas.height,
				width: canvas.width,
			});

			totalHeight += canvas.height;
			maxWidth = Math.max(maxWidth, canvas.width);

			if (onProgress) {
				onProgress(Math.round(((i + 1) / pagesToRender.length) * 100));
			}
		}

		const finalCanvas = document.createElement("canvas");
		finalCanvas.width = maxWidth;
		finalCanvas.height = totalHeight;

		const finalContext = finalCanvas.getContext("2d", {
			alpha: false,
			willReadFrequently: false,
		});

		if (!finalContext) {
			throw new Error("Final canvas context could not be created");
		}

		finalContext.fillStyle = "white";
		finalContext.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

		finalContext.imageSmoothingEnabled = true;
		finalContext.imageSmoothingQuality = "high";

		let yOffset = 0;
		for (const { canvas, height, width } of pageCanvases) {
			const xOffset = Math.floor((maxWidth - width) / 2);
			finalContext.drawImage(canvas, xOffset, yOffset);
			yOffset += height;
		}

		return new Promise<Blob>((resolve, reject) => {
			const format = "image/png";
			finalCanvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to convert canvas to blob"));
				}
			}, format);
		});
	} catch (error) {
		console.error("Error converting PDF to long image:", error);
		throw error;
	}
}
