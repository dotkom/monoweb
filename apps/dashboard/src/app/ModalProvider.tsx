"use client";

import { CreateEventModal } from "../modules/event/modals/create-event-modal";
import { type FC, type PropsWithChildren } from "react";
import { ModalsProvider } from "@mantine/modals";

const modals = {
    "event/create": CreateEventModal,
} as const;

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
    <ModalsProvider modals={modals}>{children}</ModalsProvider>
);
