import { Title, Text } from "@dotkomonline/ui"

const KioskPage = async () => {
  return (
    <div className="flex flex-col gap-2">
      <Title element="h1" size="xl">
        Kiosken
      </Title>

      <Text className="text-gray-600 dark:text-stone-300">
        Her kan du kjøpe snacks, mat, drikke og diverse online-merch (som f.eks. klistremerker) når det trengs for lange
        arbeidsøkter, skippertak og liknende.
      </Text>

      <Title element="h2" size="lg">
        Remaining stock:
      </Title>
      <Text>Kommer når jeg har lest docsa</Text>
    </div>
  )
}

export default KioskPage
