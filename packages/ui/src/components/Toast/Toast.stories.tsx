import Toast from "./Toast";

export default {
  title: "atoms/Toast",
  component: Toast,
};

export const Danger = () => <Toast status="danger">Uh oh!</Toast>;

export const ColorlessDanger = () => (
  <Toast status="danger" monochrome={true}>
    Uh oh!
  </Toast>
);

export const Success = () => <Toast status="success">Uh oh!</Toast>;

export const ColorlessSuccess = () => (
  <Toast status="success" monochrome={true}>
    Uh oh!
  </Toast>
);

export const Warning = () => <Toast status="warning">Uh oh!</Toast>;

export const ColorlessWarning = () => (
  <Toast status="warning" monochrome={true}>
    Uh oh!
  </Toast>
);

export const Info = () => <Toast status="info">Uh oh!</Toast>;

export const ColorlessInfo = () => (
  <Toast status="info" monochrome={true}>
    Uh oh!
  </Toast>
);
