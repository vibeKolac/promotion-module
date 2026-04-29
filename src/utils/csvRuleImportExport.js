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

// type column: empty = leaf, "group_start" = open group, "group_end" = close group
const CONDITION_HEADERS = ['type', 'field', 'mode', 'values', 'operator']

function leafRow(c) {
  const vals = Array.isArray(c.values) ? c.values.join('|') : ''
  return ['', c.field, c.mode ?? 'include', escapeCell(vals), c.operator ?? ''].join(',')
}

export function exportConditionsToCSV(conditions) {
  const rows = [CONDITION_HEADERS.join(',')]
  for (const c of conditions) {
    if (c.type === 'group') {
      rows.push('group_start,,,,')
      for (const inner of c.conditions) rows.push(leafRow(inner))
      rows.push('group_end,,,,')
    } else {
      rows.push(leafRow(c))
    }
  }
  return rows.join('\n')
}

export function parseCSVToConditions(csv) {
  if (!csv?.trim()) return []
  const lines = csv.trim().split(/\r?\n/)
  const headers = splitCSVLine(lines[0])
  const hasType = headers.includes('type')
  const results = []
  let pendingGroup = null

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cells = splitCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cells[i] ?? '' })

    const rowType = hasType ? obj.type?.trim() : ''

    if (rowType === 'group_start') {
      pendingGroup = { type: 'group', conditions: [] }
      continue
    }
    if (rowType === 'group_end') {
      if (pendingGroup) { results.push(pendingGroup); pendingGroup = null }
      continue
    }

    const cond = {
      field: obj.field?.trim(),
      mode: obj.mode?.trim() || 'include',
      values: obj.values ? obj.values.split('|').map(v => v.trim()).filter(Boolean) : [],
    }
    if (obj.operator?.trim()) cond.operator = obj.operator.trim()
    if (!cond.field) continue

    if (pendingGroup) {
      pendingGroup.conditions.push(cond)
    } else {
      results.push(cond)
    }
  }

  if (pendingGroup && pendingGroup.conditions.length) results.push(pendingGroup)
  return results
}

const CONDITION_TEMPLATE_ROWS = `type,field,mode,values,operator
,categories,include,Dermocosmetology|Face Care,
,subtotal,include,50,>=
,customer_group,include,Club Silver|Club Gold,
group_start,,,,
,categories,include,Skincare,
,brands,include,Vichy|La Roche-Posay,
group_end,,,,`

export function downloadConditionsTemplate() {
  downloadCSV(CONDITION_TEMPLATE_ROWS, 'conditions-template.csv')
}
