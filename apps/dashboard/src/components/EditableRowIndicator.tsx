import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconEye } from "@tabler/icons-react"

interface EditableRowIndicatorProps {
  canEdit: boolean
  readOnlyLabel?: string
  editableLabel?: string
}

export function EditableRowIndicator({
  canEdit,
  readOnlyLabel = "Du kan se dette, men ikke redigere det",
  editableLabel = "Du kan redigere dette",
}: EditableRowIndicatorProps) {
  if (canEdit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-3.5 justify-center">
            <div className="h-5 w-1 rounded-full bg-blue-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{editableLabel}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <PermissionTooltip allowed={false} label={readOnlyLabel}>
      <div className="flex justify-center">
        <IconEye size={14} className="text-muted-foreground" />
      </div>
    </PermissionTooltip>
  )
}
