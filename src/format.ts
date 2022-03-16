function withTab(code: string, tab: number, tabSize = 2) {
  const oneTab = Array(tabSize).fill(' ').join('')
  return Array(tab).fill(oneTab).join('') + code
}

/** 處理縮進 */
export default function (lines: string[], tabSize = 2) {
  let tab = 0
  const codeString = lines.map(line => {
      if (line.trim().startsWith('}')) tab--
      const code = withTab(line, tab, tabSize)
      if (line.endsWith('{')) tab++
      return code
    })
    .join('\n')
  return codeString
}
