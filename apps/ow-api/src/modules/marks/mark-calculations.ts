export interface MarkCalculations {
  calculateEndDate: (startDate: Date, amountOfMarks: number) => Date
  calculateStartDate: () => Date
}

export const initPersonalMarksRepository = (): MarkCalculations => {
  const markDuration = 20
  const calculations: MarkCalculations = {
    calculateStartDate: () => {
      let startDate = new Date()
      if (startDate.getMonth() == 11) {
        startDate = new Date(startDate.getFullYear() + 1, 0, 15, 1)
      } else if (startDate.getMonth() == 0 && startDate.getDay() < 15) {
        startDate = new Date(startDate.getFullYear(), 0, 15, 1)
      } else if (startDate.getMonth() > 4 && startDate.getMonth() + startDate.getDate() / 100 < 7.15) {
        startDate = new Date(startDate.getFullYear(), 7, 15, 2)
      }
      return startDate
    },
    calculateEndDate: (startDate, amountOfMarks) => {
      const endDate = startDate
      for (let i = 0; i < amountOfMarks; i++) {
        endDate.setDate(endDate.getDate() + markDuration)
        if (endDate.getMonth() == 11 || (endDate.getMonth() == 0 && endDate.getDay() < 15)) {
          endDate.setDate(endDate.getDate() + 45)
        } else if (endDate.getMonth() > 4 && endDate.getMonth() + endDate.getDate() / 100 < 7.15) {
          endDate.setDate(endDate.getDate() + 75)
        }
      }
      return endDate
    },
  }
  return calculations
}
