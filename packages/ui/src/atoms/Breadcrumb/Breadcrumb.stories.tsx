import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../molecules/DropdownMenu/DropdownMenu"
import { Button } from "../Button/Button"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./Breadcrumb"

export default {
  title: "Breadcrumb",
}

export const Default = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hjem</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Arrangementer</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hundekos / Eksamens-avbrekk 🐶🐕</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const WithEllipsis = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hjem</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbEllipsis />
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hundekos / Eksamens-avbrekk 🐶🐕</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbEllipsis />
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const WithEllipsisDropdownMenu = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hjem</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              openOnHover={true}
              render={
                <Button size="icon-sm" variant="ghost">
                  <BreadcrumbEllipsis />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>Arrangementer</DropdownMenuItem>
                <DropdownMenuItem>Kalender</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Hundekos / Eksamens-avbrekk 🐶🐕</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
