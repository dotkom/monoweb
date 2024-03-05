import React from "react"
import { useSession } from "next-auth/react"
import { OnlineCompanySplash } from "@/components/organisms/OnlineCompanySplash/OnlineCompanySplash"
import { EventsPane } from "@/components/organisms/EventsPane"

const Home: React.FC = () => {
  const auth = useSession()

  return (
    <div>
      {auth.status === "unauthenticated" && <OnlineCompanySplash />}

      {/*
        .grid-item {
            background-color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.8);
            padding: 20px;
            font-size: 30px;
            text-align: center;
        }
      */}

      <div className="grid grid-cols-5 gap-4 p-10">
        <div className="bg-[#0B365B] rounded-2xl col-span-2 overflow-hidden p-5">
          <img
            src="https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fce114612-3848-40f8-8ac0-f7267556c4bb.jpeg&w=1200&q=75"
            alt="online"
            className="w-full h-3/5 object-cover rounded-2xl"
          />
          <br />
          <h2 className="m-0 text-white">AI-utviklerverktøy: Kurs med Computas</h2>
        </div>
        <div className="bg-green-10 rounded-2xl col-span-2 row-span-2 p-4">
          <p>asdf</p>
        </div>
        <div className="bg-red-10 rounded-2xl col-span-1 p-4"></div>
        <div className="bg-red-10 rounded-2xl col-span-1 p-4"></div>
        <div className="bg-red-10 rounded-2xl col-span-1 p-4"></div>
        <div className="bg-[#031024] rounded-2xl col-span-1 h-[400px] flex items-center flex-col justify-center">
          <img src="dotkom.png" alt="dotkom" className="px-8" />
          <h2 className="text-white my-2">Søk&nbsp;Dotkom!</h2>
          <p className="text-white text-center w-full p-4">
            Vil du være med å lage nettsiden vår? Søk dotkom og bli med i gjengen som lager nettsiden vår!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
