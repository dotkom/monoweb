import {Button, TextInput} from "@dotkomonline/ui";
import {PasswordInput} from "@dotkomonline/ui/src/components/PasswordInput";

export default function SignIn() {
    return (
        <form>
            <label htmlFor="email">Email</label>
            <TextInput id="email" />

            <label htmlFor="password">Password</label>
            <PasswordInput id="password" eyeColor="default" />

            <Button type="submit">Logg inn</Button>
        </form>
    )
}
