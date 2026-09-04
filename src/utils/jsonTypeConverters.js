/**
 * Schema & Code Generators from JSON
 * Generates TypeScript, Python Pydantic, Go Structs, and JSON Schema.
 */

function capitalize(str) {
  if (!str) return 'Root'
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase())
}

/**
 * TypeScript Interface Generator
 */
export function generateTypeScript(data, rootName = 'RootObject') {
  const interfaces = []

  function getType(val, keyName) {
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'
    const type = typeof val

    if (type === 'string') return 'string'
    if (type === 'number') return 'number'
    if (type === 'boolean') return 'boolean'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]'
      const itemType = getType(val[0], keyName ? `${keyName}Item` : 'Item')
      return `${itemType}[]`
    }

    if (type === 'object') {
      const nestedName = capitalize(keyName || 'Nested')
      generateInterface(val, nestedName)
      return nestedName
    }

    return 'any'
  }

  function generateInterface(obj, name) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return

    const lines = []
    lines.push(`export interface ${name} {`)

    for (const [key, value] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
      const typeStr = getType(value, key)
      lines.push(`  ${safeKey}: ${typeStr};`)
    }

    lines.push('}')
    interfaces.push(lines.join('\n'))
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      generateInterface(data[0], capitalize(rootName))
      return `// Array of ${capitalize(rootName)}\n\n${interfaces.join('\n\n')}\n\nexport type ${capitalize(rootName)}List = ${capitalize(rootName)}[];`
    }
    return `export type ${capitalize(rootName)} = ${getType(data, rootName)};`
  }

  generateInterface(data, capitalize(rootName))
  return interfaces.reverse().join('\n\n') || `export interface ${capitalize(rootName)} {}`
}

/**
 * Go Struct Generator
 */
export function generateGo(data, rootName = 'Root') {
  const structs = []

  function getGoType(val, keyName) {
    if (val === null) return 'interface{}'
    const type = typeof val

    if (type === 'string') return 'string'
    if (type === 'number') return Number.isInteger(val) ? 'int' : 'float64'
    if (type === 'boolean') return 'bool'

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}'
      return `[]${getGoType(val[0], keyName)}`
    }

    if (type === 'object') {
      const structName = capitalize(keyName || 'Nested')
      generateStruct(val, structName)
      return structName
    }

    return 'interface{}'
  }

  function generateStruct(obj, name) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return

    const lines = []
    lines.push(`type ${name} struct {`)

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = capitalize(key)
      const fieldType = getGoType(value, key)
      lines.push(`\t${fieldName} ${fieldType} \`json:"${key}"\``)
    }

    lines.push('}')
    structs.push(lines.join('\n'))
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      generateStruct(data[0], capitalize(rootName))
      return `package main\n\n${structs.reverse().join('\n\n')}`
    }
    return `package main\n\ntype ${capitalize(rootName)} []interface{}`
  }

  generateStruct(data, capitalize(rootName))
  return `package main\n\n${structs.reverse().join('\n\n')}`
}

/**
 * Python Pydantic Model Generator
 */
export function generatePython(data, rootName = 'Root') {
  const models = []

  function getPyType(val, keyName) {
    if (val === null) return 'Optional[Any]'
    const type = typeof val

    if (type === 'string') return 'str'
    if (type === 'number') return Number.isInteger(val) ? 'int' : 'float'
    if (type === 'boolean') return 'bool'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]'
      return `List[${getPyType(val[0], keyName)}]`
    }

    if (type === 'object') {
      const modelName = capitalize(keyName || 'Nested')
      generateModel(val, modelName)
      return modelName
    }

    return 'Any'
  }

  function generateModel(obj, name) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return

    const lines = []
    lines.push(`class ${name}(BaseModel):`)

    const entries = Object.entries(obj)
    if (entries.length === 0) {
      lines.push('    pass')
    } else {
      for (const [key, value] of entries) {
        const fieldType = getPyType(value, key)
        lines.push(`    ${key}: ${fieldType}`)
      }
    }

    models.push(lines.join('\n'))
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      generateModel(data[0], capitalize(rootName))
      return `from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n${models.reverse().join('\n\n')}`
    }
    return `from typing import List, Any\n\n${capitalize(rootName)} = List[Any]`
  }

  generateModel(data, capitalize(rootName))
  return `from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n${models.reverse().join('\n\n')}`
}

/**
 * JSON Schema (Draft 7) Generator
 */
export function generateJsonSchema(data) {
  function getSchema(val) {
    if (val === null) return { type: 'null' }
    const type = typeof val

    if (type === 'string') return { type: 'string' }
    if (type === 'number') return { type: Number.isInteger(val) ? 'integer' : 'number' }
    if (type === 'boolean') return { type: 'boolean' }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return { type: 'array', items: {} }
      }
      return {
        type: 'array',
        items: getSchema(val[0])
      }
    }

    if (type === 'object') {
      const properties = {}
      const required = []
      for (const [k, v] of Object.entries(val)) {
        properties[k] = getSchema(v)
        required.push(k)
      }
      return {
        type: 'object',
        properties,
        required
      }
    }

    return {}
  }

  const rootSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GeneratedSchema',
    ...getSchema(data)
  }

  return JSON.stringify(rootSchema, null, 2)
}
