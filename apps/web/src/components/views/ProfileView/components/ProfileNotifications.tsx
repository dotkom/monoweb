import React from "react"
import ToggleOption from "./ProfileToggleOption"
import PermissionOption from "./ProfilePermissionsOption"

export const browserList = [
  { key: 0, optionsText: "Notification", state: false },
  { key: 1, optionsText: "PushManager", state: false },
  { key: 2, optionsText: "ServiceWorker", state: false },
]
export const pushList = [
  { key: 0, optionsText: "Tillat pushvarsler på dette nettstedet", state: false },
  { key: 1, optionsText: "Registrer denne enheten for å motta pushvarsler", state: false },
]

const ProfileNotifications = () => {
  return (
    <div className="flex w-full flex-col">
      <h2 className="mb-2 w-full flex-auto p-1">Varsler</h2>
      <p className="m-0 w-full flex-auto p-1 text-lg font-normal italic">
        Varsler er alle henvendelser du kan motta på via både e-post og pushvarsler fra Onlines nettsider. 
      </p>
      <p className="m-0 w-full flex-auto p-1 text-lg font-normal non-italic">
        Du kan selv velge hvilke varsler du ønsker å motta, enten som e-post eller via push.
      </p>
      <h3>Nettleserstøtte</h3>
      <p className="mt-2 w-full">
        Pushvarsler støttes foreløpig ikke på iPhone og iPad fra Apple. Hvis ikke følgende funksjonalitet 
        er tilgjengelig kan det hjelpe å oppdatere nettleseren din.
      </p>
      <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
        {browserList.map((title) => {
          return <ToggleOption key={title.key}>{title.optionsText}</ToggleOption>
        })}
      </div>
      <h3>Tillat pushvarsler</h3>
      <p className="m-0 w-full flex-auto p-1 text-lg font-normal italic">
        For å kunne bruke pushvarsler må du først gi tillatelse til å vise varsler i nettleseren.
      </p>
      <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
        {pushList.map((title) => {
          return <ToggleOption key={title.key}>{title.optionsText}</ToggleOption>
        })}
      </div>
      <h3>Tillatelser</h3>
      <p>
        Du kan velge å motta varsler av hver type på enten e-post eller som pushvarsel. Enkelte 
        verdier er ikke mulig å velge, og enkelte kan ikke velges bort.
      </p>
      <div className="grid grid-cols-6 mt-2 mb-10">
        <div className="font-semibold mt-2 col-span-4">Beskrivelse</div>
        <div className="font-semibold mt-2 col-span-1 ml-auto mr-auto">Tillat epost</div>
        <div className="font-semibold mt-2 col-span-1 ml-auto mr-auto">Tillat push</div>

        <div className="col-span-4 mt-1">Søknader (medlemskap- og komitésøknader)</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Nye artikler</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Standard varslinger</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Meldinger til grupper du er med i</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Oppdatering av prikkereglene</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Ny prikk</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Nye utgaver av Offline</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Kvitteringer</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Påmeldt av administrator</div>
        <PermissionOption />
        <PermissionOption />

        <div className="col-span-4 mt-1">Påmeldingsstart</div>
        <PermissionOption />
        <PermissionOption />
      </div>
    </div>
  )
}
    
export default ProfileNotifications
      