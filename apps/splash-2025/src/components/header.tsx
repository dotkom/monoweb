const bgColor = "bg-black"
const borderColor = "border-x-black"

export const Header = () => {
  return (
    <header className="w-full fixed top-0 text-white p-10 flex justify-center z-50">
      <a href="https://online.ntnu.no" className="absolute mx-10 md:mx-20 top-0 left-0 group">
        <div className={`${bgColor} items-center py-6 pt-1 flex flex-col text-center font-bold`}>
          <img src="/online-logo-o-darkmode.svg" alt="Online logo" className="size-10 m-5" />
          <p className="group-hover:scale-[1.15] transition-all duration-500">
            Gå til
            <br />
            hovedsiden
          </p>
        </div>
        <div className={`border-b-[2.5rem] border-b-transparent border-x-[4rem] ${borderColor}`} />
      </a>
    </header>
  )
}
