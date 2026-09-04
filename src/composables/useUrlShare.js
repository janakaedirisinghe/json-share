import { ref } from 'vue'

/**
 * High-performance, self-contained URL-safe LZ-based compression & WebCrypto AES-GCM
 */

// URL-safe Base64 alphabet
const KEY_STR_URI = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$"

function compressToEncodedURIComponent(input) {
  if (input === null || input === undefined || input === "") return ""
  return _compress(input, 6, (a) => KEY_STR_URI.charAt(a))
}

function decompressFromEncodedURIComponent(input) {
  if (input === null || input === undefined || input === "") return ""
  if (input === "") return null
  input = input.replace(/ /g, "+")
  return _decompress(input.length, 32, (index) => {
    const c = input.charAt(index)
    const pos = KEY_STR_URI.indexOf(c)
    return pos > -1 ? pos : 0
  })
}

function _compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return ""
  let i, value
  const context_dictionary = {}
  const context_dictionaryToCreate = {}
  let context_c = ""
  let context_wc = ""
  let context_w = ""
  let context_enlargeIn = 2
  let context_dictSize = 3
  let context_numBits = 2
  let context_data_string = ""
  let context_data_val = 0
  let context_data_position = 0
  let ii

  for (ii = 0; ii < uncompressed.length; ii += 1) {
    context_c = uncompressed.charAt(ii)
    if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
      context_dictionary[context_c] = context_dictSize++
      context_dictionaryToCreate[context_c] = true
    }

    context_wc = context_w + context_c
    if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
      context_w = context_wc
    } else {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data_string += getCharFromInt(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data_string += getCharFromInt(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        } else {
          value = 1
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data_string += getCharFromInt(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = 0
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0
              context_data_string += getCharFromInt(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        }
        context_enlargeIn--
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits)
          context_numBits++
        }
        delete context_dictionaryToCreate[context_w]
      } else {
        value = context_dictionary[context_w]
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data_string += getCharFromInt(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      }
      context_enlargeIn--
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits)
        context_numBits++
      }
      context_dictionary[context_wc] = context_dictSize++
      context_w = String(context_c)
    }
  }

  if (context_w !== "") {
    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
      if (context_w.charCodeAt(0) < 256) {
        for (i = 0; i < context_numBits; i++) {
          context_data_val = context_data_val << 1
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data_string += getCharFromInt(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
        }
        value = context_w.charCodeAt(0)
        for (i = 0; i < 8; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data_string += getCharFromInt(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      } else {
        value = 1
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | value
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data_string += getCharFromInt(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = 0
        }
        value = context_w.charCodeAt(0)
        for (i = 0; i < 16; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0
            context_data_string += getCharFromInt(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      }
      context_enlargeIn--
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits)
        context_numBits++
      }
      delete context_dictionaryToCreate[context_w]
    } else {
      value = context_dictionary[context_w]
      for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1)
        if (context_data_position == bitsPerChar - 1) {
          context_data_position = 0
          context_data_string += getCharFromInt(context_data_val)
          context_data_val = 0
        } else {
          context_data_position++
        }
        value = value >> 1
      }
    }
    context_enlargeIn--
    if (context_enlargeIn == 0) {
      context_enlargeIn = Math.pow(2, context_numBits)
      context_numBits++
    }
  }

  value = 2
  for (i = 0; i < context_numBits; i++) {
    context_data_val = (context_data_val << 1) | (value & 1)
    if (context_data_position == bitsPerChar - 1) {
      context_data_position = 0
      context_data_string += getCharFromInt(context_data_val)
      context_data_val = 0
    } else {
      context_data_position++
    }
    value = value >> 1
  }

  while (true) {
    context_data_val = context_data_val << 1
    if (context_data_position == bitsPerChar - 1) {
      context_data_string += getCharFromInt(context_data_val)
      break
    } else {
      context_data_position++
    }
  }
  return context_data_string
}

function _decompress(length, resetValue, getNextValue) {
  const dictionary = []
  let next
  let enlargeIn = 4
  let dictSize = 4
  let numBits = 3
  let entry = ""
  const result = []
  let i
  let w
  let bits, resb, maxpower, power
  let c
  const data = { val: getNextValue(0), position: resetValue, index: 1 }

  for (i = 0; i < 3; i += 1) {
    dictionary[i] = i
  }

  bits = 0
  maxpower = Math.pow(2, 2)
  power = 1
  while (power != maxpower) {
    resb = data.val & data.position
    data.position >>= 1
    if (data.position == 0) {
      data.position = resetValue
      data.val = getNextValue(data.index++)
    }
    bits |= (resb > 0 ? 1 : 0) * power
    power <<= 1
  }

  switch ((next = bits)) {
    case 0:
      bits = 0
      maxpower = Math.pow(2, 8)
      power = 1
      while (power != maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position == 0) {
          data.position = resetValue
          data.val = getNextValue(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }
      c = String.fromCharCode(bits)
      break
    case 1:
      bits = 0
      maxpower = Math.pow(2, 16)
      power = 1
      while (power != maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position == 0) {
          data.position = resetValue
          data.val = getNextValue(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }
      c = String.fromCharCode(bits)
      break
    case 2:
      return ""
  }
  dictionary[3] = c
  w = c
  result.push(c)
  while (true) {
    if (data.index > length) {
      return ""
    }

    bits = 0
    maxpower = Math.pow(2, numBits)
    power = 1
    while (power != maxpower) {
      resb = data.val & data.position
      data.position >>= 1
      if (data.position == 0) {
        data.position = resetValue
        data.val = getNextValue(data.index++)
      }
      bits |= (resb > 0 ? 1 : 0) * power
      power <<= 1
    }

    switch ((c = bits)) {
      case 0:
        bits = 0
        maxpower = Math.pow(2, 8)
        power = 1
        while (power != maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position == 0) {
            data.position = resetValue
            data.val = getNextValue(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }

        dictionary[dictSize++] = String.fromCharCode(bits)
        c = dictSize - 1
        enlargeIn--
        break
      case 1:
        bits = 0
        maxpower = Math.pow(2, 16)
        power = 1
        while (power != maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position == 0) {
            data.position = resetValue
            data.val = getNextValue(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        dictionary[dictSize++] = String.fromCharCode(bits)
        c = dictSize - 1
        enlargeIn--
        break
      case 2:
        return result.join("")
    }

    if (enlargeIn == 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }

    if (dictionary[c]) {
      entry = dictionary[c]
    } else {
      if (c === dictSize) {
        entry = w + w.charAt(0)
      } else {
        return null
      }
    }
    result.push(entry)

    dictionary[dictSize++] = w + entry.charAt(0)
    enlargeIn--

    w = entry

    if (enlargeIn == 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }
  }
}

// -------------------------------------------------------------
// WebCrypto AES-GCM password-based encryption & decryption
// -------------------------------------------------------------
async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptData(plainText, password) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  )

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  // Convert Uint8Array to binary string then base64
  let binary = ''
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i])
  }
  return btoa(binary)
}

async function decryptData(cipherBase64, password) {
  const binary = atob(cipherBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const data = bytes.slice(28)

  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const dec = new TextDecoder()
  return dec.decode(decrypted)
}

export function useUrlShare() {
  const isSharedSession = ref(false)
  const isEncryptedSession = ref(false)
  const encryptedPayload = ref('')
  const isLoadingShortLink = ref(false)

  /**
   * Generates compressed shareable URL
   */
  async function generateShareUrl(rawJson, password = '') {
    const baseUrl = `${window.location.origin}${window.location.pathname}`

    if (password && password.trim()) {
      const encrypted = await encryptData(rawJson, password.trim())
      const compressed = compressToEncodedURIComponent(encrypted)
      return {
        url: `${baseUrl}#enc=${compressed}`,
        isEncrypted: true
      }
    }

    const compressed = compressToEncodedURIComponent(rawJson)
    return {
      url: `${baseUrl}#v1=${compressed}`,
      isEncrypted: false
    }
  }

  /**
   * Generates an anonymous Short Link (under 40 chars total) using public paste storage
   */
  async function generateShortLink(rawJson) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`

    // 1. Try Bytebin (fast, CORS-friendly, zero-auth public pastebin)
    try {
      const res = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: rawJson
      })
      if (res.ok) {
        const data = await res.json()
        if (data.key) {
          return {
            url: `${baseUrl}#id=${data.key}`,
            id: data.key,
            service: 'bytebin'
          }
        }
      }
    } catch (err) {
      console.warn('Bytebin upload failed, trying fallback...', err)
    }

    // 2. Fallback: DPaste API
    try {
      const formData = new URLSearchParams()
      formData.append('content', rawJson)
      formData.append('expiry_days', '90')
      formData.append('format', 'json')

      const res = await fetch('https://dpaste.com/api/v2/', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const urlText = await res.text()
        const cleanUrl = urlText.trim()
        const id = cleanUrl.split('/').filter(Boolean).pop()
        return {
          url: `${baseUrl}#dp=${id}`,
          id,
          service: 'dpaste'
        }
      }
    } catch (err) {
      console.warn('DPaste fallback failed', err)
    }

    throw new Error('Could not create short link. Please use the Full Compressed URL instead.')
  }

  /**
   * Reads URL hash and unpacks shared payload (supports direct compressed #v1=, #enc= and short links #id=, #dp=)
   */
  async function checkUrlForSharedData() {
    const hash = window.location.hash
    if (!hash || hash.length < 4) return null

    // Direct compressed hash
    if (hash.startsWith('#v1=')) {
      const rawHash = hash.substring(4)
      const decompressed = decompressFromEncodedURIComponent(rawHash)
      if (decompressed) {
        isSharedSession.value = true
        return { data: decompressed, encrypted: false }
      }
    }

    // Encrypted hash
    if (hash.startsWith('#enc=')) {
      const rawHash = hash.substring(5)
      const decompressed = decompressFromEncodedURIComponent(rawHash)
      if (decompressed) {
        isSharedSession.value = true
        isEncryptedSession.value = true
        encryptedPayload.value = decompressed
        return { encrypted: true }
      }
    }

    // Short link via Bytebin (#id=...)
    if (hash.startsWith('#id=')) {
      const id = hash.substring(4).trim()
      if (id) {
        isSharedSession.value = true
        isLoadingShortLink.value = true
        try {
          const res = await fetch(`https://bytebin.lucko.me/${id}`)
          if (res.ok) {
            const jsonText = await res.text()
            isLoadingShortLink.value = false
            return { data: jsonText, encrypted: false, isShortLink: true }
          }
        } catch (err) {
          console.error('Failed to load short link payload', err)
        } finally {
          isLoadingShortLink.value = false
        }
      }
    }

    // Short link via DPaste (#dp=...)
    if (hash.startsWith('#dp=')) {
      const id = hash.substring(4).trim()
      if (id) {
        isSharedSession.value = true
        isLoadingShortLink.value = true
        try {
          const res = await fetch(`https://dpaste.com/${id}.txt`)
          if (res.ok) {
            const jsonText = await res.text()
            isLoadingShortLink.value = false
            return { data: jsonText, encrypted: false, isShortLink: true }
          }
        } catch (err) {
          console.error('Failed to load dpaste short link', err)
        } finally {
          isLoadingShortLink.value = false
        }
      }
    }

    return null
  }

  async function unlockEncryptedPayload(password) {
    if (!encryptedPayload.value) throw new Error('No encrypted data found')
    const decrypted = await decryptData(encryptedPayload.value, password)
    isEncryptedSession.value = false
    return decrypted
  }

  function clearShareUrl() {
    isSharedSession.value = false
    isEncryptedSession.value = false
    encryptedPayload.value = ''
    history.replaceState(null, '', window.location.pathname)
  }

  return {
    isSharedSession,
    isEncryptedSession,
    isLoadingShortLink,
    generateShareUrl,
    generateShortLink,
    checkUrlForSharedData,
    unlockEncryptedPayload,
    clearShareUrl
  }
}
