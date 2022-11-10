import { ColumnType } from "kysely";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;
