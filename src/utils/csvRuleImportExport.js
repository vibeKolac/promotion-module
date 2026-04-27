const HEADERS = ['id', 'name', 'type', 'value', 'valueUnit', 'status', 'priority', 'startDate', 'endDate', 'stackingGroupId', 'exclusive', 'processingOrder', 'conditions', 'gifts']

function escapeCell(v) {
  const s = v == null ? '' : String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportRulesToCSV(rules) {
  if (!rules.length) return ''
  const rows = [HEADERS.join(',')]
  for (const r of rules) {
    rows.push(HEADERS.map(h => {
      if (h === 'conditions' || h === 'gifts') return escapeCell(JSON.stringify(r[h] ?? []))
      return escapeCell(r[h])
    }).join(','))
  }
  return rows.join('\n')
}

function splitCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function parseCSVToRules(csv) {
  if (!csv?.trim()) return []
  const lines = csv.trim().split(/\r?\n/)
  const headers = splitCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => {
      let v = values[i] ?? ''
      if (h === 'conditions' || h === 'gifts') { try { v = JSON.parse(v) } catch { v = [] } }
      else if (h === 'priority' || h === 'processingOrder') v = v ? Number(v) : null
      else if (h === 'exclusive') v = v === 'true'
      obj[h] = v
    })
    return obj
  })
}

export function downloadCSV(csv, filename = 'promotions.csv') {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Condition CSV (used in PromotionForm detail) ────────────────────────────

const CONDITION_HEADERS = ['field', 'mode', 'values', 'operator']

// values are pipe-separated inside the cell to avoid collision with CSV commas
export function exportConditionsToCSV(conditions) {
  const rows = [CONDITION_HEADERS.join(',')]
  for (const c of conditions) {
    const vals = Array.isArray(c.values) ? c.values.join('|') : ''
    rows.push([c.field, c.mode ?? 'include', escapeCell(vals), c.operator ?? ''].join(','))
  }
  return rows.join('\n')
}

export function parseCSVToConditions(csv) {
  if (!csv?.trim()) return []
  const lines = csv.trim().split(/\r?\n/)
  const headers = splitCSVLine(lines[0])
  const results = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cells = splitCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cells[i] ?? '' })
    const cond = {
      field: obj.field?.trim(),
      mode: obj.mode?.trim() || 'include',
      values: obj.values ? obj.values.split('|').map(v => v.trim()).filter(Boolean) : [],
    }
    if (obj.operator?.trim()) cond.operator = obj.operator.trim()
    if (cond.field) results.push(cond)
  }
  return results
}

const CONDITION_TEMPLATE_ROWS = [
  { field: 'categories',     mode: 'include', values: 'Dermocosmetology|Face Care',       operator: '' },
  { field: 'brands',         mode: 'include', values: 'Vichy|La Roche-Posay|Eucerin',     operator: '' },
  { field: 'skus',           mode: 'exclude', values: 'DM-00123|DM-00456',                operator: '' },
  { field: 'customer_group', mode: 'include', values: 'Club Silver|Club Gold',             operator: '' },
  { field: 'subtotal',       mode: 'include', values: '500',                              operator: '>=' },
  { field: 'quantity',       mode: 'include', values: '3',                                operator: '>=' },
]

export function downloadConditionsTemplate() {
  const rows = [CONDITION_HEADERS.join(',')]
  for (const r of CONDITION_TEMPLATE_ROWS) {
    rows.push([r.field, r.mode, escapeCell(r.values), r.operator].join(','))
  }
  downloadCSV(rows.join('\n'), 'conditions-template.csv')
}
