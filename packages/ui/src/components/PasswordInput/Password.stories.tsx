import { ComponentStory } from "@storybook/react"
import { PasswordInput } from "./Password"

export default {
    title: "atoms/PasswordInput",
    component: PasswordInput,
  }


const TemplatePassword: ComponentStory<typeof PasswordInput> = (args) => {
    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <PasswordInput id="password" label="Password" withAsterisk {...args} />
      </div>
    )
  }





export const Password = TemplatePassword.bind({})
Password.args = { placeholder: "Pass your word", inputInfo: "At least one password in password", eyeColor: "gray"}

export const PasswordWithErrormessage = TemplatePassword.bind({})
PasswordWithErrormessage.args = {placeholder: "Type a password", inputInfo: "Must have at least one animecharacter in password", eyeColor: "gray", error: "Password too short"}