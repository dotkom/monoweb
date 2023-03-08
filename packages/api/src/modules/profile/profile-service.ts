import { NotFoundError } from "../../errors/errors"
import { Profile } from "@dotkomonline/types"
import { ProfileRepository } from "./profile-repsoitory"

export interface ProfileService {
  getPrivacy: (id: string) => Promise<Profile>
}

export const initProfileService = (profileRepository: ProfileRepository): ProfileService => {
  const service = {
    getPrivacy: async (id: string) => {
      const profile = await profileRepository.getPrivacyOptionsById(id)
      if (!profile) throw new NotFoundError(`Profile for user with ID:${id} was not found`)
      return profile
    },
  }
  return service
}
