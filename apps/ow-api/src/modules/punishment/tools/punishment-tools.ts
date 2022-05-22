import { Punishment } from "../punishment"

//For some reason javascript decided to 0 index months in their date function
//so even if the array shows the 7-15 which should be 15th of July, this is correct

//summer starts 1st June, ends 15th August
const SUMMER = [
  [5, 1],
  [7, 15],
]
// winter starts 1st December, ends 15th January
const WINTER = [
  [11, 1],
  [0, 15],
]

export const addDays = (date: Date, days: number) => {
  let result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const isSuspension = (punishment: Punishment) => {
  return punishment.type == "SUSPENSION"
}

export const calculateEndDate = (date: Date, duration: number) => {
  const summer_start_date = new Date(date.getFullYear(), SUMMER[0][0], SUMMER[0][1])
  const summer_end_date = new Date(date.getFullYear(), SUMMER[1][0], SUMMER[1][1])

  const winter_start_date = new Date(date.getFullYear(), WINTER[0][0], WINTER[0][1])
  const first_winter_end_date = new Date(date.getFullYear(), WINTER[1][0], WINTER[1][1])
  const second_winter_end_date = new Date(date.getFullYear() + 1, WINTER[1][0], WINTER[1][1])

  const DAYSTOMILIS = 24 * 60 * 60 * 1000

  const DURATION = duration * DAYSTOMILIS

  let end_date = addDays(date, duration)
  let difference = 0
  // If we're in the middle of summer, add the days remaining of summer
  if (summer_start_date < date && date < summer_end_date) {
    difference = summer_end_date.getTime() - date.getTime()
  }
  // If the number of days between added_date and the beginning of summer vacation is less
  // than the duration, we need to add the length of summer to the expiry date
  else if (
    0 < summer_start_date.getTime() - date.getTime() &&
    summer_start_date.getTime() - date.getTime() < DURATION
  ) {
    difference = summer_end_date.getTime() - summer_start_date.getTime()
  }
  // Same for middle of winter vacation, which will be at the end of the year
  else if (winter_start_date < date && date < first_winter_end_date) {
    difference = first_winter_end_date.getTime() - date.getTime()
  }
  // And for before the vacation
  else if (
    0 < first_winter_end_date.getTime() - date.getTime() &&
    first_winter_end_date.getTime() - date.getTime() < DURATION
  ) {
    difference = first_winter_end_date.getTime() - winter_start_date.getTime()
  }
  // Then we need to check the edge case where now is between newyears and and of winter vacation
  else if (second_winter_end_date > date) {
    difference = second_winter_end_date.getTime() - date.getTime()
  }
  const days = difference / (1000 * 3600 * 24)
  end_date = addDays(end_date, days)
  return end_date
}
