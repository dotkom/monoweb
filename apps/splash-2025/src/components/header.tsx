import { Text, cn } from "@dotkomonline/ui"

const bgColor = "bg-black"
const borderColor = "border-x-black"

export const Header = () => {
  return (
    <header className="w-full fixed top-0 text-white p-10 flex justify-center z-50">
      <a href="https://online.ntnu.no" className={cn("absolute top-0 left-5 sm:left-7 md:left-16 lg:left-24 group")}>
        <div
          className={cn("py-6 pt-1 px-2 flex flex-col text-center font-bold", "uppercase font-bold text-sm", bgColor)}
        >
          <div className="flex flex-col gap-4 mt-2 items-center group-hover:scale-[1.05] transition-transform duration-500">
            <img src="/online-logo-o-darkmode.svg" alt="Online logo" className="size-10" />
            <Text>
              Gå til <br />
              hovedsiden
            </Text>
          </div>
        </div>
        <div className={`border-b-[2rem] border-b-transparent border-x-[4rem] ${borderColor} rounded-b-sm`} />
      </a>
    </header>
  )
}
