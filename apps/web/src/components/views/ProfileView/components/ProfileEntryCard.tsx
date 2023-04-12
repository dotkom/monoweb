import { Button, TextInput } from "@dotkomonline/ui"
import React from "react"

const ProfileEntryCard = () => {
  return (
    <div>
      <h2>NTNU adgangskort</h2>
      <p className="mt-3">Adgangskortet kan brukes til en rekke ting i Linjeforeningen Online. Dette inkluderer:</p>
      <ol>
        <li>1: Verifisering av identitet og oppmøte på arrangementer</li>
        <li>2: Kjøp i kiosksystemet Nibble på Onlinekontoret</li>
      </ol>
      <h2>Registrer eller endre kortet ditt</h2>
      <p className="mt-3">For å registrere kortet ditt, må du skrive inn EM koden du finner på baksiden av kortet.</p>
      <p>Derfra hentes RFID koden.</p>
      <h3>Nåværende registrert kort</h3>
      <p>
        <b>EM kode:</b> 1234567890 {/* Må endres */}
      </p>
      <p>
        <b>RFID:</b> 0987654321 {/* Må endres */}
      </p>
      <h3>Nytt kort</h3>
      <label>EM kort</label>
      <TextInput />
      <input className="ml-10" type="text" id="emInput" />
      <h2>Grafisk representasjon</h2>
      <p>Kortet som vises under er kun en grafisk representasjon, som veiledning for å finne EM koden:</p>
      <Button color="blue" variant="solid">
        Lagre
      </Button>
    </div>
  )
}
export default ProfileEntryCard
