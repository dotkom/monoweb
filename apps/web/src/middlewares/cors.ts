import Cors from "cors"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import * as util from "util"

const cors = Cors()
const corsHandler = util.promisify(cors)

export const applyCorsMiddleware = (route: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply cors headers
  await corsHandler(req, res)
  return await route(req, res)
}
