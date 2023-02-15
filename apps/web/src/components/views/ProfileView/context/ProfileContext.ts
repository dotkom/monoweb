import { createContext, Dispatch, SetStateAction } from "react"

interface IProfileContext {
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
<<<<<<< HEAD
  profileDetails?: string
=======
  user: User | object
  profileDetails?: any
>>>>>>> e62180d (fix: linting errors)
  setProfileDetails?: Dispatch<SetStateAction<boolean>>
}

export const ProfileContext = createContext<IProfileContext | null>(null)
