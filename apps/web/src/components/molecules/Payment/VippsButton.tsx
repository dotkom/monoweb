import { FC } from "react"
import VippsIcon from "@/components/icons/VippsIcon"

export interface VippsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const VippsButton: FC<VippsButtonProps> = (props: VippsButtonProps) => {
  return (
    <button
      className="flex h-10 w-full items-center justify-center rounded-lg bg-[#ff5b24] text-white hover:bg-[#dd491c] "
      {...props}
    >
      <VippsIcon className="w-[6.5rem] fill-white" />
    </button>
  )
}

export default VippsButton