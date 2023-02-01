import { appendIconComponentCache } from "@elastic/eui/es/components/icon/icon"

import { icon as EuiIconApps } from "@elastic/eui/es/components/icon/assets/apps"
import { icon as EuiIconHelp } from "@elastic/eui/es/components/icon/assets/help"
import { icon as EuiIconLogoElastic } from "@elastic/eui/es/components/icon/assets/logo_elastic"
import { icon as EuiIconWrench } from "@elastic/eui/es/components/icon/assets/wrench"

appendIconComponentCache({
  apps: EuiIconApps,
  help: EuiIconHelp,
  logoElastic: EuiIconLogoElastic,
  wrench: EuiIconWrench,
})