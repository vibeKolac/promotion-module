import { exportRulesToCSV, parseCSVToRules } from '../../src/utils/csvRuleImportExport'

const sampleRules = [
  { id: 'r1', name: 'Test Rule', type: 'discount', value: '20', valueUnit: '%',
    status: 'active', priority: 10, startDate: '2026-01-01', endDate: '2026-12-31',
    conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }], gifts: [] },
]

describe('exportRulesToCSV', () => {
  it('returns empty string for empty array', () => {
    expect(exportRulesToCSV([])).toBe('')
  })
  it('includes header row and data row', () => {
    const csv = exportRulesToCSV(sampleRules)
    expect(csv).toContain('name')
    expect(csv).toContain('Test Rule')
  })
  it('serializes conditions as JSON string', () => {
    const csv = exportRulesToCSV(sampleRules)
    expect(csv).toContain('brands')
  })
})

describe('parseCSVToRules', () => {
  it('parses CSV back to rule objects including conditions', () => {
    const csv = exportRulesToCSV(sampleRules)
    const parsed = parseCSVToRules(csv)
    expect(parsed[0].name).toBe('Test Rule')
    expect(parsed[0].type).toBe('discount')
    expect(Array.isArray(parsed[0].conditions)).toBe(true)
    expect(parsed[0].conditions[0].field).toBe('brands')
    expect(parsed[0].conditions[0].values).toEqual(['Nike'])
  })
  it('returns empty array for empty input', () => {
    expect(parseCSVToRules('')).toEqual([])
  })
})
