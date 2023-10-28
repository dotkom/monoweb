import { Database } from "@dotkomonline/db"
import { DB } from "@dotkomonline/db/src/db.generated"
import { JobListingId } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable } from "kysely"

type Location = DB["jobListingLocation"]
type LocationSelect = Selectable<Location>
type LocationId = LocationSelect["id"]

type Link = DB["jobListingLocationLink"]
type LinkSelect = Selectable<Link>
type LinkInsert = Insertable<Link>
type LinkDelete = {
  jobListingId: JobListingId
  locationId: LocationId
}

export interface JobListingLocationLinkRepository {
  add(payload: LinkInsert): Promise<LinkSelect>
  remove(payload: LinkDelete): Promise<void>
}

export class JobListingLocationLinkRepositoryImpl implements JobListingLocationLinkRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async add(payload: LinkInsert): Promise<LinkSelect> {
    return this.db
      .insertInto("jobListingLocationLink")
      .values({ locationId: payload.locationId, jobListingId: payload.jobListingId })
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async remove(payload: LinkDelete): Promise<void> {
    await this.db
      .deleteFrom("jobListingLocationLink")
      .where("jobListingId", "=", payload.jobListingId)
      .where("locationId", "=", payload.locationId)
      .execute()
  }
}
