import { UserService } from "../services/user-service";

// TODO: create a service type which is an object with all available services
export type Context = {
  userService: UserService;
};
