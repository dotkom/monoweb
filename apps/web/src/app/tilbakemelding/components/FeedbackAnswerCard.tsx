"use client"

import type { FeedbackFormAnswer, FeedbackQuestion, FeedbackQuestionAnswer } from "@dotkomonline/types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button, Icon, Text, Title } from "@dotkomonline/ui"
import type { Payload } from "recharts/types/component/DefaultTooltipContent"
import { useDeleteFeedbackQuestionAnswerMutation } from "../mutations"

const CHART_COLORS: string[] = ["#2b7fff", "#00bc7d", "#fd9a00", "#fb2c36", "#8e51ff", "#f6339a"] as const

interface FeedbackQuestionAnswerCardProps {
  question: FeedbackQuestion
  answers: FeedbackFormAnswer[]
  canDelete: boolean
}

export const FeedbackAnswerCard = ({ question, answers, canDelete }: FeedbackQuestionAnswerCardProps) => {
  const questionAnswers = answers.flatMap((a) => a.questionAnswers).filter((qa) => qa.questionId === question.id)
  const selectedOptions = questionAnswers.flatMap((a) => a.selectedOptions)

  const deleteQuestionAnswerMutation = useDeleteFeedbackQuestionAnswerMutation()

  function deleteQuestionAnswer(id: string) {
    if (canDelete && confirm("Er du sikker på at du vil slette tilbakemeldingen?")) {
      deleteQuestionAnswerMutation.mutate(id)
    }
  }

  const chart = (() => {
    switch (question.type) {
      case "TEXT":
      case "LONGTEXT":
        return <TextTable answers={questionAnswers} canDelete={canDelete} onDelete={deleteQuestionAnswer} />
      case "CHECKBOX": {
        const checkedCount = questionAnswers.filter((qa) => qa.value === true).length

        const data: ChartValue[] = [
          {
            name: "Ja",
            value: checkedCount,
            id: "yes",
          },
          {
            name: "Nei",
            value: questionAnswers.length - checkedCount,
            id: "no",
          },
        ]

        return <QuestionPieChart data={data} />
      }
      case "SELECT":
      case "MULTISELECT": {
        const data: ChartValue[] = question.options.map((option) => ({
          name: option.name,
          value: selectedOptions.filter((selectedOption) => selectedOption.id === option.id).length,
          id: option.id,
        }))

        return <QuestionPieChart data={data} />
      }
      case "RATING": {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const count = questionAnswers.filter((qa) => qa.value === n).length
          return { name: n.toString(), value: count, id: n.toString() }
        })

        return <QuestionBarChart data={data} />
      }
    }
  })()

  return (
    <div className="flex flex-col gap-4 shadow-md p-6 rounded-lg border border-gray-300 w-full">
      <Title element="h3" size="md" className="break-words">
        {question.label}
      </Title>
      {questionAnswers.length > 0 ? chart : <Text>Ingen svar</Text>}
    </div>
  )
}

export interface ChartValue {
  name: string
  value: number
  id: string
}

export interface ChartProps {
  data: ChartValue[]
}

export const QuestionPieChart = ({ data }: ChartProps) => {
  const filteredData = data.filter((d) => d.value > 0)

  return (
    <div className="w-full h-80 [&_svg]:outline-none [&_g]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={filteredData}
            nameKey="name"
            labelLine={false}
            className="outline-none"
            cx="50%"
            stroke="none"
            cy="50%"
            outerRadius="80%"
            label={({ name }) => name}
          >
            <LabelList dataKey="value" fontSize={12} fill="white" />
            {filteredData.map((item, index) => {
              // Avoid color collisions
              const isLastItem = index === filteredData.length - 1
              const fallbackColor = CHART_COLORS[Math.max(index - 2, 0) % CHART_COLORS.length]
              const firstItemColor = CHART_COLORS[0]
              let color = CHART_COLORS[index % CHART_COLORS.length]
              if (isLastItem && firstItemColor === color) color = fallbackColor

              return <Cell key={item.id} fill={color} />
            })}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const QuestionBarChart = ({ data }: ChartProps) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%" debounce={200}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Bar dataKey="value" fill="#2b7fff" isAnimationActive={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "black", opacity: "0.1" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TextTableProps {
  answers: FeedbackQuestionAnswer[]
  canDelete?: boolean
  onDelete(id: string): void
}

const TextTable = ({ answers, canDelete, onDelete }: TextTableProps) => {
  const filteredAnswers = answers.filter((a) => !!a.value)

  return (
    <div className="flex flex-col gap-3">
      {filteredAnswers.map((answer) => (
        <div
          key={answer.id}
          className="flex flex-row justify-between items-start dark:bg-transparent p-3 rounded shadow-sm border border-gray-300 dark:border-stone-400"
        >
          <Text size="sm" className="break-words">
            {answer.value}
          </Text>
          {canDelete && (
            <Button variant="text" color="red" onClick={() => onDelete(answer.id)}>
              <Icon icon="tabler:trash" className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Payload<string, number>[]
}

const ChartTooltip = ({ payload, active }: ChartTooltipProps) => {
  if (!payload?.length || !active) return null
  const { name, value } = payload[0].payload

  return (
    <div className="bg-white dark:bg-stone-600 py-1 px-2 rounded shadow flex flex-row gap-4">
      <Text size="sm">{name}</Text>
      <Text className="font-semibold" size="sm">
        {value}
      </Text>
    </div>
  )
}
