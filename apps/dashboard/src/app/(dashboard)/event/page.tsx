export default function EventPage() {
  const events = [] satisfies string[]
  return <pre>{JSON.stringify(events, null, 2)}</pre>
}
