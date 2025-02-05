import type { Event } from "@dotkomonline/types";

export interface EventDisplayProps extends Event {
    startCol: number;
    span: number;
    leftEdge: boolean;
    rightEdge: boolean;
    active: boolean;
}

export interface Week {
    dates: Date[];
    events: EventDisplayProps[][];
}

export interface CalendarData {
    weeks: Week[];
    year: number;
    month: number;
}