import type { Story } from "@ladle/react"
import { PasswordInput, PasswordInputProps } from "./Password"

export default {
  title: "PasswordInput",
}

const Template: Story<PasswordInputProps> = (args) => <PasswordInput {...args} />

export const Default = Template.bind({})

Default.args = {
  label: "Password",
  withAsterisk: true,
  eyeColor: "default",
}

export const Password = Template.bind({})
Password.args = { placeholder: "Pass your word", inputInfo: "At least one password in password", eyeColor: "gray" }

export const PasswordWithErrormessage = Template.bind({})
PasswordWithErrormessage.args = {
  placeholder: "Type a password",
  inputInfo: "Must have at least one animecharacter in password",
  eyeColor: "gray",
  error: "Password too short",
}
