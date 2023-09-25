import {Button, TextInput} from "@dotkomonline/ui";
import {PasswordInput} from "@dotkomonline/ui/src/components/PasswordInput";

export default function SignUp() {
    return (
        <form>
            <label htmlFor="email">E-post adresse</label>
            <TextInput id="email" />

            <label htmlFor="givenName">Fornavn</label>
            <TextInput id="givenName" />

            <label htmlFor="middleName">Mellomnavn</label>
            <TextInput id="middleName" />

            <label htmlFor="familyName">Etternavn</label>
            <TextInput id="familyName" />

            <label htmlFor="gender">Kjønn</label>
            <TextInput id="gender" />

            <label htmlFor="password">Passord</label>
            <PasswordInput id="password" eyeColor="default" />

            <Button type="submit">Opprett bruker</Button>
        </form>
    )
}
