import { type Dispatch, type SetStateAction, createContext } from "react";

interface IProfileContext {
    editMode: boolean;
    profileDetails?: string;
    setEditMode: Dispatch<SetStateAction<boolean>>;
    setProfileDetails?: Dispatch<SetStateAction<boolean>>;
}

export const ProfileContext = createContext<IProfileContext | null>(null);
