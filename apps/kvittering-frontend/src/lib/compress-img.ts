import imageCompression from "browser-image-compression";
import heic2any from "heic2any";

/**
 * Compresses an image file to be under the specified maximum size in bytes
 * Uses different strategies for different image types to maintain readability
 *
 * @param file The image file to compress
 * @param maxSizeBytes Maximum size in bytes for the compressed image
 * @returns A promise that resolves to the compressed file
 */
export async function compressImage(
	file: File,
	maxSizeBytes: number,
): Promise<File> {
	// If the file is already smaller than the max size, return it as is
	if (file.size <= maxSizeBytes) {
		return file;
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (event) => {
			const img = new Image();
			img.src = event.target?.result as string;

			img.onload = () => {
				const canvas = document.createElement("canvas");

				// For PNG images (which often contain text/receipts), use a different approach
				// that prioritizes readability
				const isPNG = file.type === "image/png";

				// Start with a more reasonable scale based on image size
				// Calculate initial scale based on image dimensions and target size
				const pixelCount = img.width * img.height;
				const estimatedBytesPerPixel = file.size / pixelCount;
				const targetPixelCount = maxSizeBytes / estimatedBytesPerPixel;
				const scale = Math.min(1.0, Math.sqrt(targetPixelCount / pixelCount));

				// For PNG, start with higher quality and more gradual scaling
				const quality = isPNG ? 0.9 : 0.8;
				const qualityStep = isPNG ? 0.05 : 0.1;
				const scaleStep = isPNG ? 0.9 : 0.7;

				// Minimum acceptable quality and scale to prevent unreadable images
				const minQuality = isPNG ? 0.7 : 0.4;
				const minScale = isPNG ? 0.5 : 0.2;

				const tryCompress = (currentQuality: number, currentScale: number) => {
					// Resize the canvas based on scale
					const width = Math.max(Math.floor(img.width * currentScale), 800); // Ensure minimum width for readability
					const height = Math.floor(img.height * (width / img.width)); // Maintain aspect ratio

					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(new Error("Could not get canvas context"));
						return;
					}

					// For PNG, use better image rendering for text
					if (isPNG) {
						ctx.imageSmoothingQuality = "high";
					}

					// Clear canvas and draw resized image
					ctx.clearRect(0, 0, width, height);
					ctx.drawImage(img, 0, 0, width, height);

					// For PNG, use PNG format to maintain quality, otherwise use JPEG for better compression
					const outputType = isPNG ? file.type : "image/jpeg";
					const dataUrl = canvas.toDataURL(outputType, currentQuality);
					const bytes = Math.ceil(((dataUrl.length - 22) * 3) / 4); // Approximate size calculation

					console.log("Current quality:", currentQuality);
					console.log("Current scale:", currentScale);
					console.log("Bytes:", bytes);
					console.log("Max size:", maxSizeBytes);

					if (
						bytes <= maxSizeBytes ||
						(currentQuality <= minQuality && currentScale <= minScale)
					) {
						// Convert data URL to Blob
						fetch(dataUrl)
							.then((res) => res.blob())
							.then((blob) => {
								// Create a new File from the compressed Blob
								const compressedFile = new File([blob], file.name, {
									type: outputType,
								});
								resolve(compressedFile);
							})
							.catch(reject);
					} else if (currentQuality > minQuality) {
						// Try with lower quality first
						tryCompress(
							Math.max(currentQuality - qualityStep, minQuality),
							currentScale,
						);
					} else {
						// If quality is already at minimum, reduce size
						tryCompress(quality, Math.max(currentScale * scaleStep, minScale));
					}
				};

				tryCompress(quality, scale);
			};

			img.onerror = () => {
				reject(new Error("Failed to load image"));
			};
		};

		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};
	});
}

// https://www.npmjs.com/package/browser-image-compression
export async function compressImageWithLibrary(
	file: File,
	maxSizeBytes: number = 1024 * 1024 * 10,
	onProgress?: (progress: number) => void,
): Promise<{ compressedFile: File; downloadLink: string }> {
	let imageFile: Blob | Blob[] | File = file;
	console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
	console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

	const options = {
		maxSizeMB: maxSizeBytes / 1024 / 1024,
		maxWidthOrHeight: 1000,
		useWebWorker: true,
		onProgress: onProgress,
		fileType: "image/jpeg",
	};

	console.log(file.name);
	try {
		if (
			file.name.toUpperCase().endsWith(".HEIC") ||
			file.name.endsWith(".HEIF")
		) {
			console.log("Converting HEIC/HEIF to JPEG...");
			imageFile = await heic2any({ blob: imageFile, toType: "image/jpeg" });
			console.log("Conversion completed:", file);
		}

		const compressedFile = await imageCompression(imageFile as File, options);
		console.log(
			"compressedFile instanceof Blob",
			compressedFile instanceof Blob,
		); // true
		console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

		// Create a download link for the compressed file
		const downloadLink = URL.createObjectURL(compressedFile);

		return { compressedFile, downloadLink };
	} catch (error) {
		console.log(error);
		throw error;
	}
}
