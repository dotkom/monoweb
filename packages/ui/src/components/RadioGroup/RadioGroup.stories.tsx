import { Label } from '@radix-ui/react-label';
import {RadioGroup, RadioGroupItem} from './RadioGroup';

export default {
    title: 'RadioGroup',
    component: RadioGroup,
};

export const Default = () => (
    <RadioGroup defaultValue="option-one">
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
    </div>
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
    </div>
    </RadioGroup>
);
