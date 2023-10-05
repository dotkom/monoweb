import { type NextApiRequest } from "next";

export const bufferRequest = async (req: NextApiRequest) =>
    new Promise<Buffer>((resolve, reject) => {
        const chunks: Array<Buffer> = [];

        req.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        req.on("error", reject);
    });
