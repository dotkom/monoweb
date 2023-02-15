import { User } from "next-auth"
import { createContext, Dispatch, SetStateAction } from "react"

interface IProfileContext {
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  user: User | {}
  profileDetails?: any
  setProfileDetails?: any
}

export const ProfileContext = createContext<IProfileContext>({
  editMode: false,
  setEditMode: () => {},
  user: {},
  profileDetails: {},
  setProfileDetails: () => {},
})
