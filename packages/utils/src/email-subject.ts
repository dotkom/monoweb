export function formatEmailSubject<Subject extends string>(subject: Subject): `(Online) ${Subject}` {
  if (subject.startsWith("(Online) ")) {
    return subject as `(Online) ${Subject}`
  }

  return `(Online) ${subject}`
}
