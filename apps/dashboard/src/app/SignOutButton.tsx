"use client";

import { type FC } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@mantine/core";

export const SignOutButton: FC = () => (
    <Button variant="outline" onClick={async () => signOut()}>
        Logg ut
    </Button>
);
