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

  it('weekend: startDate is Saturday, endDate is Sunday (+1)', () => {
    const { startDate, endDate } = calculateDatesFromDuration('weekend')
    const start = new Date(startDate)
    const end = new Date(endDate)
    expect(start.getDay()).toBe(6) // Saturday
    expect(end.getDay()).toBe(0)   // Sunday
    const diff = (end - start) / 86400000
    expect(diff).toBe(1)
  })

  it('two-weeks: endDate is 14 days after startDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('two-weeks')
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000
    expect(diff).toBe(14)
  })

  it('season: endDate is 90 days after startDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('season')
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000
    expect(diff).toBe(90)
  })

  it('unknown duration: endDate is 30 days after startDate', () => {
    const { startDate, endDate } = calculateDatesFromDuration('unknown')
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000
    expect(diff).toBe(30)
  })
})
