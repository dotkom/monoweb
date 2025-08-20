import { server } from "@/utils/trpc/server"
import type { Company, JobListing, JobListingEmployment } from "@dotkomonline/types"
import { Button, Icon, RichText, Text, Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
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
        <div className="w-2/3 flex flex-col gap-8">
          <RichText content={jobListing.description} />
          <RichText content={jobListing.about} />
        </div>

        <div className="flex flex-col gap-4 w-1/3">
          <CompanyBox company={jobListing.company} />

          <ApplicationInfoBox jobListing={jobListing} />

          <ApplyButton jobListing={jobListing} />
        </div>
      </div>
    </div>
  )
}

interface ApplicationInfoBoxProps {
  jobListing: JobListing
}

const ApplicationInfoBox = ({ jobListing }: ApplicationInfoBoxProps) => {
  const locationNames = jobListing.locations.map((location) => location.name).join(", ") || "Ukjent lokasjon"

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-stone-800 rounded-2xl">
      <Title size="md">Stillingsinformasjon</Title>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:world" width={20} height={20} />
        <Text>{locationNames}</Text>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:clock" width={20} height={20} />
        <Deadline jobListing={jobListing} />
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
        <EmploymentType employment={jobListing.employment} />
      </div>
    </div>
  )
}

interface CompanyBoxProps {
  company: Company
}

const CompanyBox = ({ company }: CompanyBoxProps) => {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-2 pt-6 px-6 pb-2 rounded-t-2xl bg-gray-100 dark:bg-stone-800">
        {company.imageUrl ? (
          <div className="p-2 bg-white rounded-md w-fit">
            <img src={company.imageUrl} alt="Company logo" className="h-16 rounded-sm" />
          </div>
        ) : (
          <Title size="xl">{company.name}</Title>
        )}

        {company.description && <RichText content={company.description} lineClamp="line-clamp-3" hideToggleButton />}
      </div>
      <Link href={`/bedrifter/${company.slug}`} className="pb-4 px-6 pt-3 rounded-b-2xl bg-gray-200 dark:bg-stone-600">
        <div className="flex flex-row gap-1 items-center mx-auto w-fit">
          <Text>Se bedriften</Text>
          <Icon icon="tabler:arrow-up-right" />
        </div>
      </Link>
    </div>
  )
}

interface EmploymentTypeProps {
  employment: JobListingEmployment
}

const EmploymentType = ({ employment }: EmploymentTypeProps) => {
  switch (employment) {
    case "FULLTIME":
      return <Text>"Heltid"</Text>
    case "PARTTIME":
      return <Text>"Deltid"</Text>
    case "SUMMER_INTERNSHIP":
      return <Text>"Sommerjobb"</Text>
    default:
      return <Text>"Ukjent stillingsprosent"</Text>
  }
}

interface DeadlineProps {
  jobListing: JobListing
}

const Deadline = ({ jobListing }: DeadlineProps) => {
  const { deadline, deadlineAsap } = jobListing

  if (deadlineAsap) {
    return <Text>Frist fortløpende</Text>
  }

  if (!deadline) {
    return <Text>Ingen frist oppgitt</Text>
  }

  return <Text>Frist {formatDate(deadline, "dd.MM.yyyy")}</Text>
}

interface ApplyButtonProps {
  jobListing: JobListing
}

const ApplyButton = ({ jobListing }: ApplyButtonProps) => {
  const { applicationLink, applicationEmail } = jobListing

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
