import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { Toggle } from "@dotkomonline/ui"
import { useEffect, useState } from "react"
import { NextPageWithLayout } from "../_app"

const PrivacyPage: NextPageWithLayout = () => {
  const [checked, setIsChecked] = useState(false)

  useEffect(() => {
    console.log(checked)
  }, [checked])

  return (
    <div>
      <Toggle label="Default toggle" isChecked={checked} setIsChecked={() => setIsChecked(!checked)} />
    </div>
  )
}

PrivacyPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default PrivacyPage
