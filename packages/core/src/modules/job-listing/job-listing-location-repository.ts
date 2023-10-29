import { Database } from "@dotkomonline/db"
import { DB } from "@dotkomonline/db/src/db.generated"
import { Insertable, Kysely, Selectable } from "kysely"

type Location = DB["jobListingLocation"]

export type LocationSelect = Selectable<Location>
type LocationId = LocationSelect["id"]

type LocationInsert = Insertable<Location>
type LocationDelete = {
  id: LocationSelect["id"]
}

export interface JobListingLocationRepository {
  add(payload: LocationInsert): Promise<LocationSelect>
  remove(payload: LocationDelete): Promise<LocationSelect>

  getAll(): Promise<LocationSelect[]>
  getByName(name: string): Promise<LocationSelect>
  getById(id: LocationId): Promise<LocationSelect>
}

export class JobListingLocationRepositoryImpl implements JobListingLocationRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAll(): Promise<LocationSelect[]> {
    const locations = await this.db.selectFrom("jobListingLocation").selectAll().orderBy("name", "asc").execute()
    return locations
  }

  async add(payload: LocationInsert): Promise<LocationSelect> {
    return this.db.insertInto("jobListingLocation").values(payload).returningAll().executeTakeFirstOrThrow()
  }

  async remove(payload: LocationDelete): Promise<LocationSelect> {
    const location = await this.getById(payload.id)
    await this.db.deleteFrom("jobListingLocation").where("id", "=", payload.id).execute()
    return location
  }

  async getByName(name: string): Promise<LocationSelect> {
    return this.db.selectFrom("jobListingLocation").where("name", "=", name).selectAll().executeTakeFirstOrThrow()
  }

  async getById(id: LocationId): Promise<LocationSelect> {
    return this.db.selectFrom("jobListingLocation").where("id", "=", id).selectAll().executeTakeFirstOrThrow()
  }
}
