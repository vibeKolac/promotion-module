import { estimateReach } from '../../src/utils/reachEstimator'

describe('estimateReach', () => {
  it('returns 100% with no conditions', () => {
    expect(estimateReach([]).percentage).toBe(100)
  })

  it('returns Broad label for >= 70%', () => {
    const r = estimateReach([])
    expect(r.label).toBe('Broad')
    expect(r.color).toBe('success')
  })

  it('reduces reach for categories include condition', () => {
    const r = estimateReach([{ field: 'categories', mode: 'include', values: ['Electronics'] }])
    expect(r.percentage).toBeLessThan(100)
  })

  it('returns Narrow label for < 40%', () => {
    const r = estimateReach([
      { field: 'categories', mode: 'include', values: ['x'] },
      { field: 'brands', mode: 'include', values: ['x'] },
      { field: 'skus', mode: 'include', values: ['x'] },
      { field: 'customer_group', mode: 'include', values: ['x'] },
    ])
    expect(r.label).toBe('Narrow')
    expect(r.color).toBe('error')
  })

  it('clamps minimum to 5%', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ field: 'skus', mode: 'include', values: [`s${i}`] }))
    expect(estimateReach(many).percentage).toBe(5)
  })
})
