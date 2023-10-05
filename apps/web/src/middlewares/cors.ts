import Cors from "cors";
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from "next";
import * as util from "util";

const cors = Cors({
    origin: ["http://localhost:3002"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});

const corsHandler = util.promisify(cors);

export const applyCorsMiddleware = (route: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    await corsHandler(req, res);

    if (req.method === "OPTIONS") {
        res.writeHead(200);

        return res.end();
    }

    return await route(req, res);
};
