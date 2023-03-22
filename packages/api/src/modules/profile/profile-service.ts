import { NotFoundError } from "../../errors/errors"
import { Profile, ProfileWrite } from "@dotkomonline/types"
import { ProfileRepository } from "./profile-repsoitory"

export interface ProfileService {
  getPrivacy: (id: string) => Promise<Profile>
  createProfile: (values: Profile) => Promise<Profile>
}

export class ProfileServiceImpl implements ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}
  async getPrivacy(id: string): Promise<Profile> {
    const profile = await this.profileRepository.getPrivacyOptionsById(id)
    if (!profile) throw new NotFoundError(`Profile for user with ID:${id} was not found`)
    return profile
  }
  async createProfile(values: ProfileWrite): Promise<Profile> {
    const profile = await this.profileRepository.createProfile(values)
    if (!profile) throw new NotFoundError(`We were not able to create a profile with that ID`)
    return profile
  }
}
