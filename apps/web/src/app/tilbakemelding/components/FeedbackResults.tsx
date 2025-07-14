"use client"

import type { AttendancePool, Attendee, Event, FeedbackFormAnswer, FeedbackQuestion } from "@dotkomonline/types"

import { Icon, Table, TableBody, TableCell, TableRow, Text, Title } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import { isSameDay } from "date-fns"
import { type ChartValue, FeedbackAnswerCard, QuestionPieChart } from "./FeedbackAnswerCard"

const formatPoolYears = (yearCriterias: number[][]): string => {
  const flat = yearCriterias.flat()
  flat.sort((a, b) => a - b)
  return `${flat.join(". ")}. klasse`
}

interface Props {
  answers: FeedbackFormAnswer[]
  questions: FeedbackQuestion[]
  attendees: Attendee[]
  event: Event
  pools: AttendancePool[]
}

export const FeedbackResults = ({ answers, questions, attendees, event, pools }: Props) => {
  questions.sort((a, b) => a.order - b.order)

  const formattedYears = formatPoolYears(pools.map((pool) => pool.yearCriteria))
  const eventDate = isSameDay(event.start, event.end)
    ? formatDate(event.start)
    : `${formatDate(event.start)} - ${formatDate(event.end)}`

  const ratingQuestions = questions.filter((q) => q.type === "RATING")
  const multipleChoiceQuestions = questions.filter(
    (q) => q.type === "SELECT" || q.type === "MULTISELECT" || q.type === "CHECKBOX"
  )
  const textQuestions = questions.filter((q) => ["TEXT", "LONGTEXT"].includes(q.type))

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-slate-7">
        <Title element="h1" className="text-3xl">
          Tilbakemelding for {event.title}
        </Title>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Icon icon="tabler:calendar-event" className="text-slate-9" />
            <Text className="text-slate-9">{eventDate}</Text>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="tabler:school" className="text-slate-9" />
            <Text className="text-slate-9">{formattedYears}</Text>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Statistics answers={answers} attendees={attendees} />
      </div>
      <div className="flex flex-col gap-16">
        {ratingQuestions.length > 0 && (
          <QuestionCardList questions={ratingQuestions} answers={answers} title="Vurderinger" />
        )}
        {multipleChoiceQuestions.length > 0 && (
          <QuestionCardList questions={multipleChoiceQuestions} answers={answers} title="Flervalgspørsmål" />
        )}
        {textQuestions.length > 0 && (
          <QuestionCardList questions={textQuestions} answers={answers} title="Tilbakemeldinger" />
        )}
      </div>
    </div>
  )
}

const QuestionCardList = ({
  questions,
  answers,
  title,
}: { questions: FeedbackQuestion[]; answers: FeedbackFormAnswer[]; title: string }) => {
  return (
    <div>
      <Title element="h2" size="lg" className="border-b border-slate-7 mb-4 pb-2">
        {title}
      </Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-wrap">
        {questions.map((question) => (
          <FeedbackAnswerCard key={question.id} question={question} answers={answers} />
        ))}
      </div>
    </div>
  )
}

const Statistics = ({ answers, attendees }: { answers: FeedbackFormAnswer[]; attendees: Attendee[] }) => {
  const gradeLevels = attendees.map((attendee) => attendee.userGrade).filter((gradelevel) => gradelevel !== null)
  const uniqueGradeLevels = Array.from(new Set(gradeLevels))

  const data: ChartValue[] = uniqueGradeLevels.map((gradeLevel) => ({
    name: `${gradeLevel}. klasse`,
    value: gradeLevels.filter((gl) => gl === gradeLevel).length,
    id: `${gradeLevel}`,
  }))

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="min-w-96 flex flex-col gap-4">
        <Title>Statistikk</Title>
        <div className="rounded overflow-hidden border border-slate-8 divide-y divide-slate-8">
          <Table>
            <TableBody>
              <StatisticsTableRow name="Påmeldte" value={attendees.length} />
              <StatisticsTableRow name="Oppmøtte" value={attendees.filter((attendee) => attendee.attended).length} />
              <StatisticsTableRow name="Venteliste" value={attendees.filter((attendee) => !attendee.reserved).length} />
              <StatisticsTableRow name="Svar" value={answers.length} />
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Title>Klassetrinn</Title>
        <QuestionPieChart data={data} />
      </div>
    </div>
  )
}

const StatisticsTableRow = ({ name, value }: { name: string; value: number }) => (
  <TableRow className="border-slate-8">
    <TableCell className="px-4 py-3">
      <Text>{name}</Text>
    </TableCell>
    <TableCell className="text-right px-4 py-3">
      <Text>{value}</Text>
    </TableCell>
  </TableRow>
)
