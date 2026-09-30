"use client"

import { GroupLogo } from "@/components/atoms/GroupLogo"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@dotkomonline/ui/components/dialog"
import { IconArrowDown, IconArrowUp, IconGripVertical } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import type { AvailabilitySlot } from "react-weekly-availability-calendar"
import committeeData from "./committees.json"
import { AvailabilityCalendar, getAvailableRanges, interviewDays } from "./AvailabilityCalendar"

type Committee = (typeof committeeData.groups)[number]

const mainCommittees = committeeData.groups.filter((committee) => committee.section === "main")
const otherCommittees = committeeData.groups.filter((committee) => committee.section === "other")

function CheckIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute right-3 top-3 flex h-5 w-5 sm:right-4 sm:top-4 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 transition-colors ${
        selected ? "border-black bg-black text-white" : "border-gray-300 bg-white text-transparent"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3 w-3 sm:h-4 sm:w-4">
        <path
          d="M5 10.5l3.2 3.2L15 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function CommitteeCard({
  committee,
  logoSrc,
  disabled = false,
  selected,
  onToggle,
}: {
  committee: Committee
  logoSrc?: string | null
  disabled?: boolean
  selected: boolean
  onToggle: () => void
}) {
  const logo = (
    <GroupLogo
      src={logoSrc ?? "/online-logo.svg"}
      alt=""
      width={80}
      height={80}
      containerClassName="h-14 w-14 shrink-0 rounded-full sm:h-20 sm:w-20"
      className="max-h-full max-w-full"
    />
  )

  return (
    <Dialog>
      <div
        className={`relative flex w-full flex-col rounded-xl border p-4 text-left shadow-sm transition-colors sm:p-6 ${
          selected
            ? "border-black bg-gray-50 ring-2 ring-black"
            : disabled
              ? "border-gray-200 bg-gray-100 opacity-45"
              : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          aria-label={committee.name}
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !disabled) {
              event.preventDefault()
              onToggle()
            }
          }}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black" />
        <CheckIndicator selected={selected} />
        <div className="flex items-center gap-4 pr-6 sm:gap-6 sm:pr-8">
          {logo}
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-semibold leading-snug sm:text-xl">{committee.name}</h3>
            <p className="mt-2 line-clamp-3 min-h-[4.25rem] text-sm leading-relaxed text-gray-800 sm:min-h-[4.875rem] sm:text-base">
              {committee.description}
            </p>
          </div>
        </div>
        <DialogTrigger
          aria-label={`Les mer om ${committee.name}`}
          className="relative z-20 mt-3 min-h-11 self-end rounded-lg px-2 text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Les mer
        </DialogTrigger>
      </div>
      <DialogContent
        className="max-h-[85dvh] overflow-y-auto bg-white p-6 text-black sm:max-w-lg"
        showCloseButton={false}
      >
        <div className="flex items-center gap-4 pr-10">
          {logo}
          <DialogTitle className="text-xl font-semibold">{committee.name}</DialogTitle>
        </div>
        <DialogDescription className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 sm:text-base">
          {committee.description}
        </DialogDescription>
        <DialogClose
          aria-label="Lukk"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-xl hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          <span aria-hidden="true">×</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

const steps = ["Informasjon", "Velg komiteer", "Søknad", "Intervjutider", "Rekkefølge", "Oppsummering"]
const stepHeadings = [
  "Om opptaket",
  "Velg komiteer og grupper",
  "Søknaden din",
  "Intervjutider",
  "Juster prioritering",
  "Se over søknaden din",
]

function MultipleChoiceQuestion({
  title,
  name,
  options,
  value,
  onChange,
}: {
  title: string
  name: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="rounded-2xl border border-gray-300 p-3 sm:p-6">
      <legend className="px-2 text-base font-semibold sm:text-lg">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 sm:p-4 ${
              value === option ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-black"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ProgressBar({ current, onNavigate }: { current: number; onNavigate: (step: number) => void }) {
  const percent = ((current - 1) / (steps.length - 1)) * 100

  return (
    <nav aria-label="Fremdrift" className="mb-6 sm:mb-10">
      <p className="mb-4 text-sm font-medium text-gray-600">
        Steg {current} av {steps.length}
        <span className="sm:hidden"> · {steps[current - 1]}</span>
      </p>

      <div className="relative">
        <div className="absolute left-[8.333%] right-[8.333%] top-[22px] sm:top-4 h-1 -translate-y-1/2 rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${percent}%` }} />
        </div>

        <ol className="relative grid grid-cols-6">
          {steps.map((label, i) => {
            const step = i + 1
            const done = step < current
            const active = step === current
            return (
              <li key={label} aria-current={active ? "step" : undefined} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onNavigate(step)}
                  aria-label={`Gå til steg ${step}: ${label}`}
                  className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-lg sm:min-h-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      done
                        ? "border-green-600 bg-green-600 text-white"
                        : active
                          ? "border-green-600 bg-white text-green-700"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {done ? "✓" : step}
                  </span>
                  <span
                    className={`mt-2 text-center text-sm max-sm:sr-only ${
                      active ? "font-semibold text-black" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default function CommitteeApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [year, setYear] = useState("")
  const [motivation, setMotivation] = useState("")
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [priority, setPriority] = useState<string[]>([])
  const [priorityAnnouncement, setPriorityAnnouncement] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Move focus when the visible step or confirmation changes.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [currentStep, submitted])
  const selectedMainCount = mainCommittees.filter((committee) => selected.has(committee.name)).length
  const selectedCommittees = [...mainCommittees, ...otherCommittees].filter((committee) => selected.has(committee.name))
  const rankedNames = [
    ...priority.filter((name) => selected.has(name)),
    ...selectedCommittees.filter((committee) => !priority.includes(committee.name)).map((committee) => committee.name),
  ]
  const rankedCommittees = rankedNames.flatMap((name) => {
    const committee = selectedCommittees.find((committee) => committee.name === name)
    return committee ? [committee] : []
  })

  const moveToPosition = (name: string, target: number) => {
    const index = rankedNames.indexOf(name)
    if (index < 0 || index === target || target < 0 || target >= rankedNames.length) return
    const next = [...rankedNames]
    next.splice(index, 1)
    next.splice(target, 0, name)
    setPriority(next)
    setPriorityAnnouncement(`${name} er nå på plass ${target + 1} av ${next.length}.`)
  }

  const moveCommittee = (name: string, direction: -1 | 1) => {
    moveToPosition(name, rankedNames.indexOf(name) + direction)
  }

  const getLogoSrc = (committee: Committee) => {
    return committee.logoSrc ?? "/online-logo.svg"
  }

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else {
        const isMainCommittee = mainCommittees.some((committee) => committee.name === name)
        const mainCount = mainCommittees.filter((committee) => prev.has(committee.name)).length
        if (isMainCommittee && mainCount >= 3) return prev
        next.add(name)
      }
      return next
    })
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const canContinue =
    currentStep === 1 ||
    (currentStep === 2 && selected.size > 0) ||
    (currentStep === 3 && year !== "" && motivation.trim() !== "") ||
    (currentStep === 4 && availableSlots.length > 0) ||
    (currentStep === 5 && selected.size > 0) ||
    (currentStep === 6 && selected.size > 0 && year !== "" && motivation.trim() !== "" && availableSlots.length > 0)

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl bg-white px-4 py-16 text-center text-black">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none sm:text-3xl">
          Takk for søknaden!
        </h1>
        <p className="mt-3 text-gray-700">
          Du har fullført søknaden til {selectedCommittees.map((c) => c.name).join(", ")}.
        </p>
        <p className="mt-2 text-sm text-gray-500">Dette er en prototype. Ingen søknad er sendt inn.</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            goToStep(6)
          }}
          className="mt-6 sm:mt-8 rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50"
        >
          Tilbake til søknaden
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto -mt-4 max-w-6xl bg-white px-4 pb-6 text-sm text-black sm:pb-10 sm:text-base">
      <ProgressBar current={currentStep} onNavigate={goToStep} />

      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none sm:text-3xl">
        {stepHeadings[currentStep - 1]}
      </h1>
      <p className="mt-2 text-gray-700">
        {currentStep === 1 && "Bli med og skap en bedre studiehverdag i Online."}
        {currentStep === 2 && "Velg komiteene du vil søke på."}
        {currentStep === 3 && "Fortell oss litt om deg selv."}
        {currentStep === 6 && "Kontroller valgene og svarene dine før du sender inn."}
      </p>

      {currentStep === 1 && (
        <section className="mt-6 sm:mt-8 rounded-2xl border border-gray-300 p-4 sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">Slik fungerer opptaket</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-gray-700">
            Komiteene er en fin måte å bli kjent med andre studenter på, prøve noe nytt og bidra til Online. Du trenger
            ikke å ha erfaring fra før — vi vil gjerne høre hva du har lyst til å være med på!
          </p>
          <ol className="mt-6 space-y-5">
            <li>
              <h3 className="font-semibold">1. Velg komiteer</h3>
              <p className="mt-1 text-gray-600">
                Du kan søke på opptil tre komiteer i den første gruppen og så mange du vil i den andre.
              </p>
            </li>
            <li>
              <h3 className="font-semibold">2. Fortell litt om deg selv</h3>
              <p className="mt-1 text-gray-600">Svar på noen korte spørsmål og fortell hvorfor du vil bli med.</p>
            </li>
            <li>
              <h3 className="font-semibold">3. Velg tider for intervju</h3>
              <p className="mt-1 text-gray-600">
                Marker tidspunktene som passer. Intervjuet er en hyggelig prat der vi blir bedre kjent.
              </p>
            </li>
          </ol>
          <p className="mt-6 sm:mt-8 text-sm text-gray-500">Du kan gå tilbake og endre svarene dine underveis.</p>
        </section>
      )}

      {currentStep === 2 && (
        <>
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">Komiteer</h2>
            <p className="mb-4 mt-1 text-sm text-gray-600">Velg opptil tre.</p>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-6 md:grid-cols-2">
              {mainCommittees.map((committee) => (
                <CommitteeCard
                  key={committee.name}
                  committee={committee}
                  logoSrc={getLogoSrc(committee)}
                  disabled={!selected.has(committee.name) && selectedMainCount >= 3}
                  selected={selected.has(committee.name)}
                  onToggle={() => toggle(committee.name)}
                />
              ))}
            </div>
          </section>

          <hr className="mt-8 border-gray-200 sm:mt-12" />
          <section className="mt-8 sm:mt-12">
            <h2 className="text-2xl font-semibold sm:text-3xl">Andre komiteer og grupper</h2>
            <p className="mb-4 mt-1 text-sm text-gray-600">Velg så mange du vil.</p>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-6 md:grid-cols-2">
              {otherCommittees.map((committee) => (
                <CommitteeCard
                  key={committee.name}
                  committee={committee}
                  logoSrc={getLogoSrc(committee)}
                  selected={selected.has(committee.name)}
                  onToggle={() => toggle(committee.name)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {currentStep === 3 && (
        <div className="mt-6 sm:mt-8 space-y-6">
          <MultipleChoiceQuestion
            title="Hvilket studieår går du?"
            name="year"
            options={["1. år", "2. år", "3. år", "4. år", "5. år"]}
            value={year}
            onChange={setYear}
          />
          <div className="rounded-2xl border border-gray-300 p-3 sm:p-6">
            <label htmlFor="motivation" className="text-base font-semibold sm:text-lg">
              Skriv kort om deg selv
            </label>
            <p className="mt-1 text-sm text-gray-600">Dette vil sendes til alle komiteene</p>
            <textarea
              id="motivation"
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              rows={5}
              placeholder="Fortell litt om deg selv …"
              className="mt-4 w-full resize-y rounded-xl border border-gray-300 p-3 text-base sm:p-4 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      )}

      {currentStep === 4 && <AvailabilityCalendar selected={availableSlots} onChange={setAvailableSlots} />}

      {currentStep === 5 && (
        <section aria-label="Prioritering" className="mt-6 sm:mt-8 rounded-2xl border border-gray-300 p-4 sm:p-8">
          <DragDropContext
            dragHandleUsageInstructions="Trykk mellomrom for å løfte gruppen, bruk piltastene for å flytte, og mellomrom for å slippe. Escape avbryter."
            onDragStart={({ draggableId }, { announce }) => announce(`${draggableId} er løftet.`)}
            onDragUpdate={({ draggableId, destination }, { announce }) => {
              if (destination) announce(`${draggableId}, plass ${destination.index + 1} av ${rankedNames.length}.`)
            }}
            onDragEnd={({ draggableId, destination, reason }, { announce }) => {
              if (reason === "CANCEL" || !destination) {
                announce("Flyttingen er avbrutt.")
                return
              }
              moveToPosition(draggableId, destination.index)
              announce(`${draggableId} er nå på plass ${destination.index + 1} av ${rankedNames.length}.`)
            }}
          >
            <Droppable droppableId="committee-priorities" direction="vertical">
              {(listProvided) => (
                <ol
                  ref={listProvided.innerRef}
                  {...listProvided.droppableProps}
                  aria-label="Grupper i prioritert rekkefølge"
                  className="list-none"
                >
                  {rankedCommittees.map((committee, index) => (
                    <Draggable
                      key={committee.name}
                      draggableId={committee.name}
                      index={index}
                      disableInteractiveElementBlocking
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-2 flex items-center gap-2 rounded-xl border bg-white p-2 sm:gap-3 sm:p-3 ${snapshot.isDragging ? "border-gray-400 shadow-xl" : "border-gray-200"}`}
                        >
                          <button
                            type="button"
                            {...provided.dragHandleProps}
                            aria-label={`Flytt ${committee.name}`}
                            className="flex h-11 w-8 shrink-0 touch-none items-center justify-center rounded-lg text-gray-400 cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                          >
                            <IconGripVertical aria-hidden="true" className="h-5 w-5" />
                          </button>
                          <GroupLogo
                            src={getLogoSrc(committee)}
                            alt=""
                            width={40}
                            height={40}
                            containerClassName="h-8 w-8 rounded-full sm:h-10 sm:w-10"
                            className="max-h-full max-w-full"
                          />
                          <span className="min-w-0 flex-1 break-words text-sm font-medium sm:text-base">
                            <span className="sr-only">
                              Plass {index + 1} av {rankedCommittees.length}:{" "}
                            </span>
                            {committee.name}
                          </span>
                          <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:gap-2">
                            <button
                              type="button"
                              aria-label={`Flytt ${committee.name} opp`}
                              aria-disabled={index === 0}
                              onClick={() => moveCommittee(committee.name, -1)}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black aria-disabled:cursor-not-allowed aria-disabled:opacity-35"
                            >
                              <IconArrowUp aria-hidden="true" className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Flytt ${committee.name} ned`}
                              aria-disabled={index === rankedCommittees.length - 1}
                              onClick={() => moveCommittee(committee.name, 1)}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black aria-disabled:cursor-not-allowed aria-disabled:opacity-35"
                            >
                              <IconArrowDown aria-hidden="true" className="h-5 w-5" />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {listProvided.placeholder}
                </ol>
              )}
            </Droppable>
          </DragDropContext>
          <p role="status" className="sr-only">
            {priorityAnnouncement}
          </p>
        </section>
      )}

      {currentStep === 6 && (
        <div className="mt-6 sm:mt-8 space-y-6">
          <section aria-labelledby="review-committees" className="rounded-2xl border border-gray-300 p-3 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="review-committees" className="text-base font-semibold sm:text-lg">
                Valgte grupper
              </h2>
            </div>
            <ol className="mt-4 list-none space-y-3">
              {rankedCommittees.map((committee, index) => (
                <li
                  key={committee.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                >
                  <span className="sr-only">Plass {index + 1}.</span>
                  <GroupLogo
                    src={getLogoSrc(committee)}
                    alt=""
                    width={32}
                    height={32}
                    containerClassName="h-8 w-8 rounded-full"
                    className="max-h-full max-w-full"
                  />
                  {committee.name}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-gray-600">{selected.size} valgt</p>
          </section>

          <section aria-labelledby="review-answers" className="rounded-2xl border border-gray-300 p-3 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="review-answers" className="text-base font-semibold sm:text-lg">
                Svarene dine
              </h2>
            </div>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="font-medium">Hvilket studieår går du?</dt>
                <dd className="mt-1 text-gray-700">{year}</dd>
              </div>
              <div>
                <dt className="font-medium">Skriv litt om deg selv</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{motivation}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="review-interviews" className="rounded-2xl border border-gray-300 p-3 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="review-interviews" className="text-base font-semibold sm:text-lg">
                Intervjutider
              </h2>
            </div>
            <dl className="mt-5 space-y-3">
              {interviewDays.map((day) => {
                const times = getAvailableRanges(day, availableSlots)
                return times.length > 0 ? (
                  <div key={day} className="flex flex-wrap gap-x-4 gap-y-1">
                    <dt className="font-medium">{day}</dt>
                    <dd className="text-gray-700">Kl. {times.join(", ")}</dd>
                  </div>
                ) : null
              })}
            </dl>
          </section>
          <p className="text-sm text-gray-500">
            Dette er en prototype. Innsendingen viser en bekreftelse, men sender ingen søknad.
          </p>
        </div>
      )}

      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-between gap-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => goToStep(currentStep - 1)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold sm:px-5 sm:text-base hover:bg-gray-50"
          >
            Tilbake
          </button>
        )}
        {currentStep === 2 && (
          <div className="order-first w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
            <ul aria-label="Valgte komiteer" className="flex flex-wrap items-center gap-3">
              {selectedCommittees.map((committee) => (
                <li
                  key={committee.name}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-1.5 text-xs sm:py-2 sm:pr-4 sm:pl-2 sm:text-sm"
                >
                  <GroupLogo
                    src={getLogoSrc(committee)}
                    alt=""
                    width={24}
                    height={24}
                    containerClassName="h-6 w-6 rounded-full"
                    className="max-h-full max-w-full"
                  />
                  {committee.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {currentStep === 2 && (
          <span className="ml-auto shrink-0 text-xs text-gray-600 sm:ml-0 sm:text-sm" aria-live="polite">
            {selected.size} valgt
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (!canContinue) return
            if (currentStep < steps.length) goToStep(currentStep + 1)
            else {
              setSubmitted(true)
              window.scrollTo({ top: 0, behavior: "auto" })
            }
          }}
          disabled={!canContinue}
          className={`ml-auto shrink-0 rounded-lg bg-black font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${currentStep === 6 ? "px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg" : "px-4 py-3 text-sm sm:px-6 sm:text-base"}`}
        >
          {currentStep === 6 ? "Send søknad" : "Neste steg"}
        </button>
      </div>
    </div>
  )
}
