import { server } from "@/utils/trpc/server"
import type { JobListing } from "@dotkomonline/types"
import { Button, Icon, RichText, Text, Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface JobListingProps {
  params: Promise<{
    id: string
  }>
}

const JobListingPage = async ({ params }: JobListingProps) => {
  const { id: rawParamId } = await params
  const paramId = decodeURIComponent(rawParamId)

  const jobListing = await server.jobListing.get.query(paramId)

  if (!jobListing) {
    return notFound()
  }

  const applyButton = getApplyButton(jobListing)

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="text"
        element={Link}
        href="/karriere"
        icon={<Icon icon="tabler:arrow-left" className="text-lg" />}
        className="w-fit"
      >
        Andre muligheter
      </Button>

      <Title element="h1" size="xl" className="text-4xl">
        {jobListing.title}
      </Title>

      <div className="flex flex-row gap-8 justify-between">
        <div className="w-2/3">
          <RichText content={jobListing.description} />
        </div>

        <div className="flex flex-col gap-4 w-1/3">
          <CompanyBox company={jobListing.company} />

          <ApplicationInfoBox jobListing={jobListing} />

          {applyButton}
        </div>
      </div>
    </div>
  )
}

const ApplicationInfoBox = ({ jobListing }: { jobListing: JobListing }) => {
  const employmentType = getEmploymentType(jobListing.employment)
  const locationNames = jobListing.locations.map((location) => location.name).join(", ") || "Ingen lokasjon"
  const deadlineElement = getDeadline(jobListing.deadline, jobListing.deadlineAsap)

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-100 rounded-2xl">
      <Title size="md">Stillingsinformasjon</Title>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:world" width={20} height={20} />
        <Text>{locationNames}</Text>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:clock" width={20} height={20} />
        {deadlineElement}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:calendar-event" width={20} height={20} />
        <div className="flex flex-col gap-0.5">
          {jobListing.start && <Text>Starter {formatDate(jobListing.start, "dd. MMM yyyy")}</Text>}
          {jobListing.end && <Text>Slutter {formatDate(jobListing.end, "dd. MMM yyyy")}</Text>}
        </div>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:briefcase" width={20} height={20} />
        <Text>{employmentType}</Text>
      </div>
    </div>
  )
}

const CompanyBox = ({ company }: { company: JobListing["company"] }) => {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-2 pt-6 px-6 pb-2 rounded-t-2xl bg-gray-100">
        {company.imageUrl ? (
          <Image src={company.imageUrl} height={96} width={96} alt="Company logo" className="rounded-2xl" />
        ) : (
          <Title size="xl">{company.name}</Title>
        )}

        <RichText
          content={company.description ?? "<p>Ingen beskrivelse</p>"}
          lineClamp="line-clamp-3"
          hideToggleButton
        />
      </div>
      <Link href={`/bedrifter/${company.slug}`} className="pb-4 px-6 pt-3 rounded-b-2xl bg-gray-200">
        <div className="flex flex-row gap-1 items-center mx-auto w-fit">
          <Text>Se bedriften</Text>
          <Icon icon="tabler:arrow-up-right" />
        </div>
      </Link>
    </div>
  )
}

const getEmploymentType = (employment: JobListing["employment"]) => {
  switch (employment) {
    case "FULLTIME":
      return "Heltid"
    case "PARTTIME":
      return "Deltid"
    case "SUMMER_INTERNSHIP":
      return "Sommerjobb"
    default:
      return "Ukjent stillingsprosent"
  }
}

const getDeadline = (deadline: Date | null, deadlineAsap: boolean) => {
  if (deadlineAsap) {
    return <Text>Frist fortløpende</Text>
  }

  if (!deadline) {
    return <Text>Ingen frist</Text>
  }

  return <Text>Frist {formatDate(deadline, "dd.MM.yyyy")}</Text>
}

const getApplyButton = ({ applicationLink, applicationEmail }: JobListing) => {
  if (applicationLink || applicationEmail) {
    const href = applicationLink || `mailto:${applicationEmail}`
    const text = applicationLink ? "Søk" : "Søk via e-post"

    return (
      <Button color="brand" element={Link} href={href} className="min-h-[6rem]">
        {text} {<Icon icon={"tabler:arrow-up-right"} />}
      </Button>
    )
  }

  return (
    <Button disabled className="min-h-[6rem]">
      Søk
    </Button>
  )
}

export default JobListingPage
