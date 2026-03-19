/**
 * Calculate start and end dates based on a duration type
 * @param {string} duration - Duration type: 'day', 'weekend', 'week', 'two-weeks', 'month', 'season', or default
 * @returns {{startDate: string, endDate: string}} Start and end dates as ISO date strings (YYYY-MM-DD)
 */
export function calculateDatesFromDuration(duration) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let startDate = new Date(today)
  let endDate = new Date(today)

  switch (duration) {
    case 'day':
      // Start and end are the same day
      break

    case 'weekend': {
      // Find next Saturday and Sunday
      const dayOfWeek = today.getDay()
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
      startDate.setDate(today.getDate() + daysUntilSaturday)
      endDate.setDate(today.getDate() + daysUntilSaturday + 1)
      break
    }

    case 'week':
      // 7 days from today
      endDate.setDate(today.getDate() + 7)
      break

    case 'two-weeks':
      // 14 days from today
      endDate.setDate(today.getDate() + 14)
      break

    case 'month':
      // 30 days from today
      endDate.setDate(today.getDate() + 30)
      break

    case 'season':
      // 90 days from today
      endDate.setDate(today.getDate() + 90)
      break

    default:
      // Default to 30 days
      endDate.setDate(today.getDate() + 30)
      break
  }

  return {
    startDate: formatISODate(startDate),
    endDate: formatISODate(endDate)
  }
}

/**
 * Format a Date object as an ISO date string (YYYY-MM-DD)
 * @param {Date} date - The date to format
 * @returns {string} ISO date string
 */
function formatISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
