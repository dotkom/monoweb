export default async function () {
  const response = await fetch("http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=5")
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  const data = await response.json()

  return (
    <div>
      <h1>Det funka!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
