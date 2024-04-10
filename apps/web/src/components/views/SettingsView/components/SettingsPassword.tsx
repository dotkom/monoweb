import { Button, TextInput } from "@dotkomonline/ui";

const SettingsPassword = () => (
  <div className="pb-8">
    <p className="text-2xl font-semibold mb-5">Endre passord</p>
    <div className="flex flex-col space-y-6 mb-6">
      <TextInput
        label="Nåværende passord"
        placeholder="Passord"
        type="password"
      />
      <TextInput
        label="Nytt passord"
        placeholder="Nytt Passord"
        type="password"
      />
      <TextInput
        label="Gjenta nytt passord"
        placeholder="Gjenta passord"
        type="password"
      />
    </div>
    <Button className="float-right mb-6">Endre passord</Button>
  </div>
);

export default SettingsPassword;
