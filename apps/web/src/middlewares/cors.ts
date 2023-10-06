import Cors from "cors";
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from "next";
import * as util from "util";

const cors = Cors({
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  origin: ["http://localhost:3002"],
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
