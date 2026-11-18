// Rows of clouds spread down the page. Different widths and speeds give a bit of depth.
// In dark mode only the bottom rows are shown, so the night sky has fewer clouds, low down.
export const CLOUD_ROWS = [
  {
    top: "top-0",
    width: "w-[max(180vw,120rem)]",
    duration: "200s",
    delay: "0s",
    opacity: 1,
    hideInDarkMode: true,
  },
  {
    top: "top-[20%]",
    width: "w-[max(220vw,140rem)]",
    duration: "260s",
    delay: "-130s",
    opacity: 0.8,
    hideInDarkMode: true,
  },
  {
    top: "top-[40%]",
    width: "w-[max(200vw,130rem)]",
    duration: "230s",
    delay: "-60s",
    opacity: 0.9,
    hideInDarkMode: true,
  },
  {
    top: "top-[60%]",
    width: "w-[max(240vw,150rem)]",
    duration: "280s",
    delay: "-200s",
    opacity: 0.75,
    hideInDarkMode: false,
  },
  {
    top: "top-[80%]",
    width: "w-[max(190vw,125rem)]",
    duration: "210s",
    delay: "-90s",
    opacity: 0.85,
    hideInDarkMode: false,
  },
] as const
