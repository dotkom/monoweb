// create wrapper component for details and summary

interface DetailsProps {
  children: React.ReactNode
  title: string
}

export function Details({ children, title }: DetailsProps) {
  return (
    <details>
      <summary
        style={{
          userSelect: "none",
        }}
      >
        {title}
      </summary>
      {children}
    </details>
  )
}
