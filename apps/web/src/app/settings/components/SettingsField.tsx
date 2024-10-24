import { PropsWithChildren } from "react";
import { SettingsSection } from "./SettingsSection";

interface FormSectionProps extends PropsWithChildren {
  title: string
}

export const SettingsField: React.FC<FormSectionProps> = ({ children, title }) => (
  <SettingsSection>
    <div className="w-1/4">{title}:</div>
    <div className="flex-1 flex justify-end">{children}</div>
  </SettingsSection>
)