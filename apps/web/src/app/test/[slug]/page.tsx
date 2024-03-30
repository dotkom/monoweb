import { getServerClient } from "@/utils/trpc/serverClient"

export default async function Test({ params }: { params: { slug: string } }) {
  const serverClient = await getServerClient();
  const asdf = await serverClient.committee.all();
  return <pre>{JSON.stringify(asdf)}</pre>
}