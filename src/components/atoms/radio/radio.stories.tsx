import { Radio, RadioProps, Label } from "theme-ui";

export default {
  title: "Radio",
  component: Radio,
};

export const radio = (props: RadioProps) => (
    <>
    <Label>
        <Radio
        name='radioGroup'
        value='true'
        defaultChecked={true}
        />
        Radio 1
    </Label>
    <Label>
        <Radio
            name='radioGroup'
            value='false'
        />
        Radio 2
    </Label>
    </>
) 