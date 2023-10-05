"use client";

import { ModalsProvider } from "@mantine/modals";
import { type FC, type PropsWithChildren } from "react";

import { CreateEventModal } from "../modules/event/modals/create-event-modal";

const modals = {
    "event/create": CreateEventModal,
} as const;

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
    <ModalsProvider modals={modals}>{children}</ModalsProvider>
);
