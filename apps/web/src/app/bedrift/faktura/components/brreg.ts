export interface Organization {
  organisasjonsnummer: string
  navn: string
  organisasjonsform: Organisasjonsform
  registreringsdatoEnhetsregisteret: Date
  registrertIMvaregisteret: boolean
  naeringskode1: InstitusjonellSektorkode
  antallAnsatte: number
  forretningsadresse: Forretningsadresse
  institusjonellSektorkode: InstitusjonellSektorkode
  registrertIForetaksregisteret: boolean
  registrertIStiftelsesregisteret: boolean
  registrertIFrivillighetsregisteret: boolean
  konkurs: boolean
  underAvvikling: boolean
  underTvangsavviklingEllerTvangsopplosning: boolean
  maalform: string
}

export interface Forretningsadresse {
  land: string
  landkode: string
  postnummer: string
  poststed: string
  adresse: string[]
  kommune: string
  kommunenummer: string
}

export interface InstitusjonellSektorkode {
  kode: string
  beskrivelse: string
}

export interface Organisasjonsform {
  kode: string
  beskrivelse: string
}
