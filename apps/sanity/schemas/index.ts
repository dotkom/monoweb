import { articleSchema } from "./article";
import { careerSchema } from "./career";
import { offlineSchema } from "./offline";
import { resourceSchema } from "./resources";
import staticPageSchema from "./static-page";

export const schemaTypes = [articleSchema, careerSchema, offlineSchema, resourceSchema, staticPageSchema];
