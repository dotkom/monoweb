export interface MarkCalculations {
  calculateEndDate: (startDate: Date, duration: number) => Date
  getExpiryDate: (marks: { start: Date; duration: number }[]) => Date | null
}

export const initCalculations = (): MarkCalculations => {
  const calculations: MarkCalculations = {
    calculateEndDate: (startDate, duration) => {
      const endDate = startDate
      endDate.setDate(endDate.getDate() + duration)
      if (endDate.getMonth() == 11 || (endDate.getMonth() == 0 && endDate.getDay() < 15)) {
        endDate.setDate(endDate.getDate() + 45)
      } else if (endDate.getMonth() > 4 && endDate.getMonth() + endDate.getDate() / 100 < 7.15) {
        endDate.setDate(endDate.getDate() + 75)
      }
      return endDate
    },
    getExpiryDate: (marks) => {
      const sortedMarks = marks.sort((a, b) => a.start.getTime() - b.start.getTime())
      const currentTime = new Date()
      let endDate: Date | null = null

      sortedMarks.forEach((mark) => {
        let markEndDate = calculations.calculateEndDate(mark.start, mark.duration)
        if (currentTime < markEndDate) {
          if (endDate) {
            markEndDate = calculations.calculateEndDate(endDate, mark.duration)
          }
          endDate = markEndDate
        }
      })
      return endDate
    },
  }
  return calculations
}
