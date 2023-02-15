import { User } from "next-auth"
import { createContext, Dispatch, SetStateAction } from "react"

interface IProfileContext {
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  user: User | object
  profileDetails?: any
  setProfileDetails?: Dispatch<SetStateAction<boolean>>
}

export const ProfileContext = createContext<IProfileContext | null>(null)
