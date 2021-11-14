import { Circle } from "../Circle";

export default {
    title: "atoms/Circle",
    component: Circle,
};

export const Primary = () => <Circle size={50}>1</Circle>;
export const Large = () => <Circle size={500}>2</Circle>;
export const Tiny = () => <Circle size={25}>3</Circle>;