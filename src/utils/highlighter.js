import Prism from 'prismjs'

// Import Prism language components
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-sql.js'
import 'prismjs/components/prism-yaml.js'
import 'prismjs/components/prism-markup.js'
import 'prismjs/components/prism-css.js'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-markdown.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-go.js'
import 'prismjs/components/prism-rust.js'
import 'prismjs/components/prism-java.js'
import 'prismjs/components/prism-c.js'
import 'prismjs/components/prism-cpp.js'
import 'prismjs/components/prism-csharp.js'
import 'prismjs/components/prism-markup-templating.js'
import 'prismjs/components/prism-php.js'

/**
 * Maps language ID to Prism grammar definition
 */
const PRISM_LANG_MAP = {
  json: 'json',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  python: 'python',
  py: 'python',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  html: 'markup',
  markup: 'markup',
  xml: 'markup',
  css: 'css',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  markdown: 'markdown',
  md: 'markdown',
  go: 'go',
  rust: 'rust',
  rs: 'rust',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  cs: 'csharp',
  php: 'php',
  plaintext: 'plaintext',
  text: 'plaintext'
}

/**
 * Safely highlights code into HTML with Prism tokens
 */
export function highlightCode(code, languageId = 'plaintext') {
  if (!code || typeof code !== 'string') return ''
  
  const prismKey = PRISM_LANG_MAP[languageId.toLowerCase()] || 'plaintext'
  const grammar = Prism.languages[prismKey]

  if (!grammar) {
    return escapeHtml(code)
  }

  try {
    return Prism.highlight(code, grammar, prismKey)
  } catch (err) {
    console.warn('Prism highlighting fallback:', err)
    return escapeHtml(code)
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
