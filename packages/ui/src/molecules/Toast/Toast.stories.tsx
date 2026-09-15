import { IconBreadOff, IconThumbDown, IconThumbUp } from "@tabler/icons-react"
import { Button } from "../../atoms/Button/Button"
import { toast, Toaster } from "../../components/toast"

export default {
  title: "Toast",
}

export const Default = () => {
  function showToast() {
    const id = toast.add({
      title: "Arrangement opprettet",
      description: "Søndag, 3. desember klokken 9:00",
      actionProps: {
        children: <Button variant="ghost" size="icon-sm" icon={<IconBreadOff />} />,
        onClick() {
          toast.close(id)
        },
      },
    })
  }

  return (
    <>
      <Button variant="outline" onClick={showToast}>
        Vis Toast
      </Button>
      <Toaster />
    </>
  )
}

export const WithPromise = () => {
  function showToast(succeed: boolean) {
    toast.promise(
      new Promise<{ name: string }>((resolve, reject) => {
        window.setTimeout(() => {
          if (succeed) {
            resolve({ name: "Arrangement" })
          } else {
            reject(new Error("Kunne ikke opprette arrangement."))
          }
        }, 2000)
      }),
      {
        loading: "Oppretter arrangement…",
        success: (data) => `${data.name} opprettet.`,
        error: "Kunne ikke opprette arrangement.",
      }
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => showToast(true)}>
        Opprett arrangement <IconThumbUp />
      </Button>
      <Button variant="outline" onClick={() => showToast(false)}>
        Opprett arrangement <IconThumbDown />
      </Button>
      <Toaster />
    </>
  )
}
