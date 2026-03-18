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
