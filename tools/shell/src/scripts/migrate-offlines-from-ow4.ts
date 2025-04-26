// @ts-ignore data.json is gitignored
import data from "./data.json" assert { type: "json" };
import { prisma } from "../services";

// see migrating-from-ow4.md for more information

for (const item of data) {
  await prisma.offline.create({
    data: {
      title: item.title,
      published: new Date(item.release_date),
      fileUrl: item.issue,
      imageUrl: item.image_id.toString(),
    },
  })
}

export {};
