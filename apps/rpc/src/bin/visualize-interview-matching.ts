import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { tz } from "@date-fns/tz"
import { addDays, addHours, addMinutes, differenceInMinutes, format, getTime, isAfter, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"
import { matchCommitteeApplicationInterviews } from "../modules/committee-application/committee-application-interview-matching"
import { createInterviewMatchingFixture } from "../modules/committee-application/committee-application-interview-matching.fixture"

/*
  This is a script to visualize the interview matching results.

  Run it with:
  pnpm --filter @dotkomonline/rpc matching:visualize

  It will create a file in `/apps/rpc/dist/` called `committee-application-calendar.html` that you can open in your
  browser.
*/

const dateContext = { in: tz("Europe/Oslo") }
const fixture = createInterviewMatchingFixture()
console.log("Matching 100 applicants…")
const result = await matchCommitteeApplicationInterviews(fixture.input)
const selections = new Map(fixture.input.groupSelections.map((selection) => [selection.id, selection]))
const applicantNames = new Map(fixture.applicants.map((applicant) => [applicant.id, applicant.name]))
const interviewsBySlot = new Map(
  result.interviews.map((interview) => [`${interview.interviewBlockId}:${getTime(interview.startsAt)}`, interview])
)

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

const columns = fixture.input.groups.flatMap((group, groupIndex) => {
  const rooms = [
    ...new Set(
      fixture.input.interviewBlocks
        .filter((block) => block.applicationGroupId === group.id)
        .map((block) => block.locationName)
    ),
  ]
  return rooms.map((room) => ({ group, groupIndex, room }))
})

const calendars = Array.from({ length: 5 }, (_, dayIndex) => {
  const day = addDays(fixture.weekStartsAt, dayIndex, dateContext)
  const dayStartsAt = addHours(day, 9)
  const dayHeading = format(day, "EEEE d. MMMM", { ...dateContext, locale: nb })
  const cellsByColumn = columns.map(({ group, room, groupIndex }) => {
    const cells = new Map<number, { span: number; html: string }>()
    const durationMinutes = group.interviewDuration === "MINUTES_20" ? 20 : 30

    for (const block of fixture.input.interviewBlocks.filter(
      (block) =>
        block.applicationGroupId === group.id &&
        block.locationName === room &&
        isSameDay(block.startsAt, day, dateContext)
    )) {
      for (
        let startsAt = block.startsAt;
        !isAfter(addMinutes(startsAt, durationMinutes), block.endsAt);
        startsAt = addMinutes(startsAt, durationMinutes)
      ) {
        const rowIndex = differenceInMinutes(startsAt, dayStartsAt) / 10
        const span = durationMinutes / 10
        const interview = interviewsBySlot.get(`${block.id}:${getTime(startsAt)}`)
        const time = `${format(startsAt, "HH:mm", dateContext)}–${format(addMinutes(startsAt, durationMinutes), "HH:mm", dateContext)}`
        let cellHtml = `<td rowspan="${span}" class="empty" title="${time}">Ledig</td>`

        if (interview !== undefined) {
          const selection = selections.get(interview.groupSelectionId)

          if (selection === undefined) {
            throw new Error(`Unknown selection ${interview.groupSelectionId}`)
          }

          const name = applicantNames.get(selection.applicationId) ?? selection.applicationId
          cellHtml = `<td rowspan="${span}" class="interview" data-applicant="${escapeHtml(selection.applicationId)}" style="--committee-color:hsl(${groupIndex * 31} 65% 90%)"><strong>${escapeHtml(name)}</strong><span>${time}</span><small>${escapeHtml(selection.applicationId)}</small></td>`
        }

        cells.set(rowIndex, { span, html: cellHtml })
      }
    }

    return cells
  })
  const nextRows = columns.map(() => 0)
  const rows = Array.from({ length: 48 }, (_, rowIndex) => {
    const time = format(addMinutes(dayStartsAt, rowIndex * 10), "HH:mm", dateContext)
    const cells = cellsByColumn
      .map((columnCells, columnIndex) => {
        if (rowIndex < nextRows[columnIndex]) {
          return ""
        }

        const cell = columnCells.get(rowIndex)

        if (cell === undefined) {
          return '<td class="unavailable" aria-label="Ingen intervjutid"></td>'
        }

        nextRows[columnIndex] = rowIndex + cell.span
        return cell.html
      })
      .join("")
    return `<tr><th scope="row">${time}</th>${cells}</tr>`
  }).join("\n")
  const headers = columns
    .map(
      ({ group, room }) =>
        `<th scope="col">${escapeHtml(group.id)}<small>${escapeHtml(room)} · ${group.interviewDuration === "MINUTES_20" ? 20 : 30} min</small></th>`
    )
    .join("")
  return `<section id="day-${dayIndex}"><h2>${dayHeading}</h2><div class="calendar"><table><thead><tr><th scope="col">Tid</th>${headers}</tr></thead><tbody>${rows}</tbody></table></div></section>`
}).join("\n")

const applicantOptions = fixture.applicants
  .toSorted((first, second) => first.name.localeCompare(second.name, "nb"))
  .map(
    (applicant) =>
      `<option value="${escapeHtml(applicant.id)}">${escapeHtml(applicant.name)} (${escapeHtml(applicant.id)})</option>`
  )
  .join("")
const unscheduled = fixture.input.groupSelections.filter(
  (selection) => !result.interviews.some((interview) => interview.groupSelectionId === selection.id)
)
const unmatchedDetails = unscheduled
  .map(
    (selection) =>
      `<li>${escapeHtml(applicantNames.get(selection.applicationId) ?? selection.applicationId)} — ${escapeHtml(selection.applicationGroupId)}</li>`
  )
  .join("")
const html = `<!doctype html>
<html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Intervjukalender</title>
<style>
*{box-sizing:border-box}body{font:14px system-ui,sans-serif;margin:24px;color:#17202a;background:#fff}h1{margin-bottom:8px}h2{text-transform:capitalize}p{max-width:850px;line-height:1.5}nav{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0}a{color:#2455a0}label{display:block;margin:18px 0}select{font:inherit;padding:8px;max-width:100%}.legend{display:flex;gap:20px;flex-wrap:wrap}.legend span:before{content:"";display:inline-block;width:16px;height:16px;margin-right:6px;vertical-align:middle;border:1px solid #c8ced5}.booked:before{background:#d7e9fd}.vacant:before{background:#fff}.closed:before{background:#eee}section{margin:32px 0}.calendar{overflow:auto;max-height:78vh;border:1px solid #c8ced5}table{border-collapse:separate;border-spacing:0;table-layout:fixed;min-width:2100px;width:100%}th,td{border-right:1px solid #d8dde3;border-bottom:1px solid #d8dde3;padding:4px 6px;vertical-align:middle}thead th{position:sticky;top:0;z-index:2;background:#fff;height:54px;text-align:left}th:first-child{width:65px;position:sticky;left:0;background:#fff;z-index:1}thead th:first-child{z-index:3}tbody th{font-size:11px;font-weight:normal;height:22px}td{font-size:11px}.interview{background:var(--committee-color)}.interview strong,.interview span,.interview small,thead small{display:block}.interview span{margin-top:3px}.interview small{color:#526071;font-size:9px}.empty{color:#8a929b;text-align:center}.unavailable{background:#eee}.dimmed{opacity:.15}.highlighted{outline:2px solid #17202a;outline-offset:-2px}details{margin:20px 0}li{margin:4px 0}@media print{.calendar{max-height:none;overflow:visible}table{min-width:0;font-size:8px}body{margin:0}nav,label{display:none}section{break-before:page}.dimmed{opacity:1}}
</style></head><body>
<h1>Intervjukalender</h1><p>100 fiktive søkere · 12 komiteer · 12.–16. oktober 2026 · Europe/Oslo. Dette er resultatet fra matcheren i denne checkouten, med både 20- og 30-minutters intervjuer.</p>
<div class="legend"><span class="booked">Intervju</span><span class="vacant">Ledig intervjutid</span><span class="closed">Ingen intervjutid</span></div>
<nav aria-label="Dager"><a href="#day-0">Mandag</a><a href="#day-1">Tirsdag</a><a href="#day-2">Onsdag</a><a href="#day-3">Torsdag</a><a href="#day-4">Fredag</a></nav>
<label for="applicant">Vis en søkers intervjuer <select id="applicant"><option value="">Alle søkere</option>${applicantOptions}</select></label>
${calendars}
<details><summary>Søknadsvalg uten tildelt intervju</summary><ul>${unmatchedDetails || "<li>Alle søknadsvalg fikk intervju.</li>"}</ul></details>
<script>document.getElementById("applicant").addEventListener("change",function(event){const applicantId=event.target.value;for(const cell of document.querySelectorAll("[data-applicant]")){cell.classList.toggle("dimmed",applicantId!==""&&cell.dataset.applicant!==applicantId);cell.classList.toggle("highlighted",applicantId!==""&&cell.dataset.applicant===applicantId)}})</script>
</body></html>`

const outputDirectory = resolve("dist")
await mkdir(outputDirectory, { recursive: true })
const outputPath = resolve(outputDirectory, "committee-application-calendar.html")
await writeFile(outputPath, html, "utf8")
console.log(`Calendar written to ${outputPath}`)
