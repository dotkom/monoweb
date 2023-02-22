import React from "react"

const ProfileMarks = () => {
  return (
    <div className="flex flex-col space-y-10">
      <Headline text="Prikker" />
      <div >
        <Headline text="Aktive Prikker"/>
        <Accordian />
        <Accordian />
        <Accordian />
      </div>
      <div>
        <Headline text="Gamle Prikker"/>
        <Accordian />
        <Accordian />
        <Accordian />
      </div>
      <div>
        <Headline text="Suspensjoner"/>
      </div>
    </div>
  )
}

const Headline = ({text}: {text: string}) => {
  return (
    <p className="text-2xl">{text}</p>
  )
}

const Accordian = () => {
  return (
  <div>
    <p></p>
  </div>
  )
}
export default ProfileMarks
