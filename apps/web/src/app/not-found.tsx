import { Button, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

const NotFound = async () => {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <Title className="text-8xl">404 :(</Title>
        <Text className="text-2xl">Side ikke funnet</Text>
      </div>

      <Button className="w-fit text-xl rounded-lg px-6 py-4" color="brand" element={Link} href="/">
        Gå til forsiden
      </Button>
    </div>
  )
}

export default NotFound
