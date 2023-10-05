import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const attendees: Array<Insertable<Database["attendee"]>> = [
    {
        id: "a76532a6-0789-471b-af41-efe99c458f92",
        createdAt: new Date("2023-02-22 13:30:04.713+00"),
        updatedAt: new Date("2023-02-22 13:30:04.713+00"),
        userId: "user_2PAEtJHM2O9RogYmT1yhx0JifPn",
        attendanceId: "09971e1c-d1ab-498d-89ca-f0b7645b74f7",
    },
    {
        id: "e9874714-fd1c-4ad2-a768-51ca3d64959f",
        createdAt: new Date("2023-02-22 13:30:04.713+00"),
        updatedAt: new Date("2023-02-22 13:30:04.713+00"),
        userId: "user_2PAKWhPTgypXLhisUS5RVHGec1o",
        attendanceId: "09971e1c-d1ab-498d-89ca-f0b7645b74f7",
    },
    {
        id: "a12f4850-a400-4dc8-916a-cd8239dca1e0",
        createdAt: new Date("2023-02-22 13:30:04.713+00"),
        updatedAt: new Date("2023-02-22 13:30:04.713+00"),
        userId: "user_2PAEtJHM2O9RogYmT1yhx0JifPn",
        attendanceId: "a12f4850-a400-4dc8-916a-cd8239dca1e0",
    },
];
