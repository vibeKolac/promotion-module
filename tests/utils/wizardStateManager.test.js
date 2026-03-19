import { calculateDatesFromDuration } from '../../src/utils/wizardStateManager'
import { describe, it, expect } from 'vitest'

describe('calculateDatesFromDuration', () => {
  it('week: endDate is 7 days after startDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('week')
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000
    expect(diff).toBe(7)
  })
  it('month: endDate is 30 days after startDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('month')
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000
    expect(diff).toBe(30)
  })
  it('day: startDate equals endDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('day')
    expect(startDate).toBe(endDate)
  })
})
