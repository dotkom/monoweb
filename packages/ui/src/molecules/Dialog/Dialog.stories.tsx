import { Button } from "../../atoms/Button/Button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog"

export default {
  title: "Dialog",
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DialogDestructive() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ScrollableBody() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open scrollable dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scrollable content</DialogTitle>
          <DialogDescription>The header and footer stay visible while the body scrolls.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            {Array.from(
              { length: 24 },
              (_, paragraphIndex) =>
                `Paragraph ${paragraphIndex + 1}. This content scrolls using the same scrollbar as the data table.`
            ).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
