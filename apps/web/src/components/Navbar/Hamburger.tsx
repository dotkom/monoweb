type HamburgerProps = {
  open: boolean
  size?: number
  className?: string
}

export function Hamburger({ open, className = "" }: HamburgerProps) {
  return (
    <span
      aria-hidden
      className={`w-10 h-10 relative inline-flex items-center justify-center hover:bg-blue-200 dark:hover:bg-stone-700 rounded-full ${className}`}
    >
      <span
        className={`absolute left-1/2 -translate-x-1/2 block h-[0.15rem] w-5 bg-black dark:bg-white rounded-full transition-all duration-300 ease-out ${
          open ? "translate-y-0 rotate-45" : "translate-y-[5px] rotate-0"
        }`}
      />
      <span
        className={`absolute left-1/2 -translate-x-1/2 block h-[0.15rem] w-5 bg-black dark:bg-white rounded-full transition-all duration-300 ease-out ${
          open ? "translate-y-0 -rotate-45" : "-translate-y-[5px] rotate-0"
        }`}
      />
    </span>
  )
}
