import { NextApiRequest, NextApiResponse } from "next"
import ical from "ical-generator";

export async function CalHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const user = req.query.user as string;
  if (!user) {
    res.status(400).json({ message: "Missing user" })
    return
  }

  const instance = ical({name: `${user} online kalender`});

  instance.createEvent({
    start: new Date(),
    end: new Date(),
    summary: 'Example Event',
    description: 'It works ;)',
    location: 'my room',
    url: 'http://online.ntnu.no'
  });

  res.status(200).send(instance.toString())
  return;

  res.status(200).json({ message: `Hello ${user}` })
}
