import { Tabs, TabsContent, TabsList, TabsTrigger } from "."

export default {
  title: "Tabs",
}

export const Default = () => (
  <Tabs defaultValue="account" className="w-[400px]">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <p className="text-slate-12 text-sm">Make changes to your account here. Click save when you&apos;re done.</p>
    </TabsContent>
    <TabsContent value="password">
      <p className="text-slate-12 text-sm">Change your password here. After saving, you&apos;ll be logged out.</p>
    </TabsContent>
  </Tabs>
)
