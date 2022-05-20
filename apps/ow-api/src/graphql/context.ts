import { ArticleService } from "@/modules/article/artice-service"
import { UserService } from "../modules/auth/user-service"

// TODO: create a service type which is an object with all available services
export interface Context {
  userService: UserService
  newSession: (userId: string) => void
  articleService: ArticleService
}
