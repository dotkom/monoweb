import { StoryObj } from "@storybook/react";
import { Label } from "../Label";
import { Toggle } from "./Toggle";

export default {
    title: "Toggle",
    component: Toggle,
};
type Story = StoryObj<typeof Toggle>;
export const Default: Story = {
    render: (args) => {
        return (
            <div className="flex items-center space-x-2">
                <Toggle id={args.id} {...args} />
                <Label htmlFor={args.id}>Airplane Mode</Label>
            </div>
        );
    },
    args: { id: "airplane-mode" },
};
