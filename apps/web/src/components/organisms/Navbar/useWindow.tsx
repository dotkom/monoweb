import { useState, useEffect } from "react"

const useWindow = () => {
  const [color, setColor] = useState("transparent")
  const [shadow, setShadow] = useState("0 0.1px 0.2px #0d0d0d")

  const changeNavbarColor = () => setColor("rgba(255,255,255, 0.8)")
  const revertNavbarColor = () => setColor("transparent")

  const changeShadow = () => setShadow("0 0.1px 1px #0d0d0d")
  const revertShadow = () => setShadow("0 0.1px 0.2px #0d0d0d")

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        changeNavbarColor()
        changeShadow()
      }
      if (window.scrollY < 40) {
        revertNavbarColor()
        revertShadow()
      }
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return [color, shadow]
}

export default useWindow
