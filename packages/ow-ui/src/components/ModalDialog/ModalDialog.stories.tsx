import ModalDialog from "./ModalDialog"
export default {
  title: "atoms/ModalDialog",
  component: ModalDialog,
}

export const Default = () => (
  <ModalDialog
    triggerBtnContent={"Open alert modal"}
    title={"Are you absolutely sure?"}
    content={
      "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
    }
    actionText={"Slett konto"}
    action={() => {}}
  />
)
