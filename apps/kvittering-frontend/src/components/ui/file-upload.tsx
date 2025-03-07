"use client";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2 as RemoveIcon } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type DropzoneOptions,
	type DropzoneState,
	type FileRejection,
	useDropzone,
} from "react-dropzone";
import { toast } from "sonner";
import { compressImageWithLibrary } from "../../lib/compress-img";
import { uploadFileToS3 } from "../../lib/upload-s3";

type DirectionOptions = "rtl" | "ltr" | undefined;

type FileUploaderContextType = {
	dropzoneState: DropzoneState;
	isLOF: boolean;
	isFileTooBig: boolean;
	removeFileFromSet: (index: number) => void;
	activeIndex: number;
	setActiveIndex: Dispatch<SetStateAction<number>>;
	orientation: "horizontal" | "vertical";
	direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
	const context = useContext(FileUploaderContext);
	if (!context) {
		throw new Error("useFileUpload must be used within a FileUploaderProvider");
	}
	return context;
};

export type UploadedFile = {
	file: File;
	url: string;
};

type FileUploaderProps = {
	value: UploadedFile[] | null;
	reSelect?: boolean;
	onValueChange: (value: UploadedFile[] | null) => void;
	dropzoneOptions: DropzoneOptions;
	orientation?: "horizontal" | "vertical";
};

/**
 * File upload Docs: {@link: https://localhost:3000/docs/file-upload}
 */

export const FileUploader = forwardRef<
	HTMLDivElement,
	FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
	(
		{
			className,
			dropzoneOptions,
			value,
			onValueChange,
			reSelect,
			orientation = "vertical",
			children,
			dir,
			...props
		},
		ref,
	) => {
		const [isFileTooBig, setIsFileTooBig] = useState(false);
		const [isLOF, setIsLOF] = useState(false);
		const [activeIndex, setActiveIndex] = useState(-1);
		const {
			accept = {
				"image/*": [".jpg", ".jpeg", ".png", ".heic"],
			},
			maxFiles = 1,
			maxSize = 50 * 1024 * 1024,
			multiple = true,
		} = dropzoneOptions;

		const reSelectAll = maxFiles === 1 ? true : reSelect;
		const direction: DirectionOptions = dir === "rtl" ? "rtl" : "ltr";

		const removeFileFromSet = useCallback(
			(i: number) => {
				if (!value) return;
				const newFiles = value.filter((_, index) => index !== i);
				onValueChange(newFiles);
			},
			[value, onValueChange],
		);

		// biome-ignore lint: test
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLDivElement>) => {
				e.preventDefault();
				e.stopPropagation();

				if (!value) return;

				const moveNext = () => {
					const nextIndex = activeIndex + 1;
					setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
				};

				const movePrev = () => {
					const nextIndex = activeIndex - 1;
					setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
				};

				const prevKey =
					orientation === "horizontal"
						? direction === "ltr"
							? "ArrowLeft"
							: "ArrowRight"
						: "ArrowUp";

				const nextKey =
					orientation === "horizontal"
						? direction === "ltr"
							? "ArrowRight"
							: "ArrowLeft"
						: "ArrowDown";

				if (e.key === nextKey) {
					moveNext();
				} else if (e.key === prevKey) {
					movePrev();
				} else if (e.key === "Enter" || e.key === "Space") {
					if (activeIndex === -1) {
						dropzoneState.inputRef.current?.click();
					}
				} else if (e.key === "Delete" || e.key === "Backspace") {
					if (activeIndex !== -1) {
						removeFileFromSet(activeIndex);
						if (value.length - 1 === 0) {
							setActiveIndex(-1);
							return;
						}
						movePrev();
					}
				} else if (e.key === "Escape") {
					setActiveIndex(-1);
				}
			},
			// biome-ignore: react-hooks/exhaustive-deps
			[value, activeIndex, removeFileFromSet],
		);

		// biome-ignore lint: test
		const onDrop = useCallback(
			async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
				const files = acceptedFiles;

				console.log("Running onDrop", {
					acceptedFiles,
					rejectedFiles,
				});

				// check for heic files
				const heicFiles = files.filter((file) => file.type === "image/heic");
				if (heicFiles.length > 0) {
					toast.error(
						"Bro, ikke HEIC fil a plis. Trykk på de tre prikkene og eksporter til 'filer', og last opp derifra",
					);
					return;
				}

				if (
					files.some(
						(file) => file.type !== "image/png" && file.type !== "image/jpeg",
					)
				) {
					toast.error("Kun mulig å laste opp png eller jpeg per nå");
					return;
				}

				if (!files) {
					toast.error("file error , probably too big");
					return;
				}

				const newValues: UploadedFile[] = value ? [...value] : [];

				if (reSelectAll) {
					newValues.splice(0, newValues.length);
				}

				for (const file of files) {
					try {
						const compressedFilePromise = toast.promise(
							compressImageWithLibrary(file, 500),
							{
								loading:
									"Komprimerer bilde... (kan ta typ 20sek hvis du lastet opp et sykt stort bilde)",
								success: "Bilde komprimert",
								error: "Feil ved komprimering. Prøv igjen!",
							},
						);

						const compressedFile = await compressedFilePromise.unwrap();

						const urlPromise = toast.promise(uploadFileToS3(compressedFile), {
							loading: "Laster opp fil...",
							success: `${file.name} ble lastet opp`,
							error: "Feil ved opplasting. Prøv igjen!",
						});

						const url = await urlPromise.unwrap();

						if (newValues.length < maxFiles) {
							newValues.push({ file, url });
						}
					} catch (error) {
						console.error("Error processing file:", error);
						// Error is already shown by the toast
					}
				}

				onValueChange(newValues);

				if (rejectedFiles.length > 0) {
					for (let i = 0; i < rejectedFiles.length; i++) {
						if (rejectedFiles[i].errors[0]?.code === "file-too-large") {
							toast.error(
								`Filen er for stor. Max størrelse er ${maxSize / 1024 / 1024}MB`,
							);
							break;
						}
						if (rejectedFiles[i].errors[0]?.message) {
							toast.error(rejectedFiles[i].errors[0].message);
							break;
						}
					}
				}
			},

			[reSelectAll, value],
		);

		useEffect(() => {
			if (!value) return;
			if (value.length === maxFiles) {
				setIsLOF(true);
				return;
			}
			setIsLOF(false);
		}, [value, maxFiles]);

		const opts = dropzoneOptions
			? dropzoneOptions
			: { accept, maxFiles, maxSize, multiple };

		const dropzoneState = useDropzone({
			...opts,
			onDrop,
			onDropRejected: () => setIsFileTooBig(true),
			onDropAccepted: () => setIsFileTooBig(false),
		});

		return (
			<FileUploaderContext.Provider
				value={{
					dropzoneState,
					isLOF,
					isFileTooBig,
					removeFileFromSet,
					activeIndex,
					setActiveIndex,
					orientation,
					direction,
				}}
			>
				<div
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className={cn(
						"grid w-full focus:outline-none overflow-hidden ",
						className,
						{
							"gap-2": value && value.length > 0,
						},
					)}
					dir={dir}
					{...props}
				>
					{children}
				</div>
			</FileUploaderContext.Provider>
		);
	},
);

FileUploader.displayName = "FileUploader";

export const FileUploaderContent = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	const { orientation } = useFileUpload();
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<div className={cn("w-full px-1")} ref={containerRef}>
			<div
				{...props}
				ref={ref}
				className={cn(
					"flex rounded-xl gap-1",
					orientation === "horizontal" ? "flex-raw flex-wrap" : "flex-col",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
});

FileUploaderContent.displayName = "FileUploaderContent";

export const FileUploaderItem = forwardRef<
	HTMLDivElement,
	{ index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
	const { removeFileFromSet, activeIndex, direction } = useFileUpload();
	const isSelected = index === activeIndex;
	return (
		<div
			ref={ref}
			className={cn(
				buttonVariants({ variant: "ghost" }),
				"h-6 p-1 justify-between cursor-pointer relative",
				className,
				isSelected ? "bg-muted" : "",
			)}
			{...props}
		>
			<div className="font-medium leading-none tracking-tight flex items-center gap-1.5 h-full w-full">
				{children}
			</div>
			<button
				type="button"
				className={cn(
					"absolute",
					direction === "rtl" ? "top-1 left-1" : "top-1 right-1",
				)}
				onClick={() => removeFileFromSet(index)}
			>
				<span className="sr-only">remove item {index}</span>
				<RemoveIcon className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
			</button>
		</div>
	);
});

FileUploaderItem.displayName = "FileUploaderItem";

export const FileInput = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
	const rootProps = isLOF ? {} : dropzoneState.getRootProps();
	return (
		<div
			ref={ref}
			{...props}
			className={`relative w-full ${
				isLOF ? "opacity-50 cursor-not-allowed " : "cursor-pointer "
			}`}
		>
			<div
				className={cn(
					`w-full rounded-lg duration-300 ease-in-out
         ${
						dropzoneState.isDragAccept
							? "border-green-500"
							: dropzoneState.isDragReject || isFileTooBig
								? "border-red-500"
								: "border-gray-300"
					}`,
					className,
				)}
				{...rootProps}
			>
				{children}
			</div>
			<Input
				ref={dropzoneState.inputRef}
				disabled={isLOF}
				{...dropzoneState.getInputProps()}
				className={`${isLOF ? "cursor-not-allowed" : ""}`}
			/>
		</div>
	);
});

FileInput.displayName = "FileInput";
