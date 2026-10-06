import { Text, Textarea, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { IconBulb } from "@tabler/icons-react"

export const studyYears = [1, 2, 3, 4, 5]

interface ApplicationDetailsStepProps {
  studyYear: number | null
  aboutMe: string
  onStudyYearChange: (year: number) => void
  onAboutMeChange: (value: string) => void
}

export function ApplicationDetailsStep({
  studyYear,
  aboutMe,
  onStudyYearChange,
  onAboutMeChange,
}: ApplicationDetailsStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Title element="h2" size="md">
          La oss bli litt kjent
        </Title>
        <Text className="leading-relaxed text-muted-foreground">
          Fortell litt om hvem du er, hva du liker å gjøre og hva du er god på.
        </Text>
      </div>
      <fieldset>
        <Title element="legend" size="sm" id="study-year-label" className="mb-3">
          Hvilket år går du på?
        </Title>
        <ToggleGroup
          aria-labelledby="study-year-label"
          variant="outline"
          color="blue"
          spacing={2}
          className="grid w-full grid-cols-5"
          multiple={false}
          value={studyYear === null ? [] : [String(studyYear)]}
          onValueChange={(values) => {
            const value = values.at(0)

            if (value !== undefined) {
              onStudyYearChange(Number(value))
            }
          }}
        >
          {studyYears.map((year) => (
            <ToggleGroupItem
              key={year}
              type="button"
              value={String(year)}
              aria-label={`${year}. år`}
              className="h-16 min-w-0 rounded-xl px-1 text-base sm:h-20 sm:text-lg"
            >
              {year}. år
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>
      <section
        aria-labelledby="application-writing-tips"
        className="rounded-2xl border border-blue-200/60 bg-blue-50/60 p-5 dark:border-blue-900/60 dark:bg-blue-950/30"
      >
        <div className="mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <IconBulb className="size-5" aria-hidden="true" />
          <Title element="h2" size="sm" id="application-writing-tips">
            Usikker på hva du skal skrive?
          </Title>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <Text element="li">Hva liker du å gjøre i fritiden din?</Text>
          <Text element="li">Hva er du god på?</Text>
          <Text element="li">Hvordan vil du beskrive deg selv som person?</Text>
        </ul>
        <Text className="mt-4 text-sm text-muted-foreground">
          Bruk tipsene som inspirasjon. Du må ikke svare på alt. Teksten trenger ikke være lang.
        </Text>
      </section>
      <Textarea
        id="about-me"
        name="aboutMe"
        label="Skriv kort om deg selv"
        aria-describedby="application-writing-note"
        placeholder="Jeg er en person som ..."
        className="min-h-56 rounded-xl p-4 text-base leading-relaxed"
        value={aboutMe}
        onChange={(event) => {
          onAboutMeChange(event.target.value)
        }}
        rows={7}
        required
      />
      <Text id="application-writing-note" className="-mt-5 text-sm text-muted-foreground">
        Teksten deles med alle gruppene du har valgt. Unngå sensitive opplysninger.
      </Text>
    </div>
  )
}
