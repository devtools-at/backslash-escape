/**
 * Backslash Escape
 * Escape/unescape backslash sequences
 *
 * Online tool: https://devtools.at/tools/backslash-escape
 *
 * @packageDocumentation
 */

function escapeString(str: string, style: EscapeStyle): string {
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);

    // Common escapes for all styles
    switch (char) {
      case "\\":
        result += "\\\\";
        break;
      case "\n":
        result += "\\n";
        break;
      case "\r":
        result += "\\r";
        break;
      case "\t":
        result += "\\t";
        break;
      case "\b":
        result += "\\b";
        break;
      case "\f":
        result += "\\f";
        break;
      case "\"":
        result += "\\\"";
        break;
      case "'":
        // Only escape single quotes in some styles
        if (style === "python" || style === "c") {
          result += "\\'";
        } else {
          result += char;
        }
        break;
      default:
        // Handle Unicode characters
        if (code < 32 || code > 126) {
          if (style === "json" || style === "javascript") {
            // Use \uXXXX for control characters and non-ASCII
            if (code < 0x10000) {
              result += "\\u" + code.toString(16).padStart(4, "0");
            } else {
              // Handle surrogate pairs for characters beyond BMP
              const high = Math.floor((code - 0x10000) / 0x400) + 0xD800;
              const low = ((code - 0x10000) % 0x400) + 0xDC00;
              result += "\\u" + high.toString(16).padStart(4, "0");
              result += "\\u" + low.toString(16).padStart(4, "0");
            }
          } else if (style === "python") {
            // Python uses \uXXXX for Unicode
            if (code < 0x10000) {
              result += "\\u" + code.toString(16).padStart(4, "0");
            } else {
              result += "\\U" + code.toString(16).padStart(8, "0");
            }
          } else if (style === "c") {
            // C uses \xXX for hex
            if (code < 256) {
              result += "\\x" + code.toString(16).padStart(2, "0");
            } else {
              result += "\\u" + code.toString(16).padStart(4, "0");
            }
          }
        } else {
          result += char;
        }
    }
  }

  return result;
}

function unescapeString(str: string): string {
  let result = "";
  let i = 0;

  while (i < str.length) {
    if (str[i] === "\\" && i + 1 < str.length) {
      const next = str[i + 1];

      switch (next) {
        case "\\":
          result += "\\";
          i += 2;
          break;
        case "n":
          result += "\n";
          i += 2;
          break;
        case "r":
          result += "\r";
          i += 2;
          break;
        case "t":
          result += "\t";
          i += 2;
          break;
        case "b":
          result += "\b";
          i += 2;
          break;
        case "f":
          result += "\f";
          i += 2;
          break;
        case "\"":
          result += "\"";
          i += 2;
          break;
        case "'":
          result += "'";
          i += 2;
          break;
        case "u":
        case "U":
          // Handle \uXXXX or \UXXXXXXXX
          const isLong = next === "U";
          const hexLength = isLong ? 8 : 4;
          if (i + 2 + hexLength <= str.length) {
            const hexCode = str.substring(i + 2, i + 2 + hexLength);
            if (/^[0-9a-fA-F]+$/.test(hexCode)) {
              const code = parseInt(hexCode, 16);
              result += String.fromCodePoint(code);
              i += 2 + hexLength;
            } else {
              // Invalid hex, keep as-is
              result += str[i];
              i++;
            }
          } else {
            result += str[i];
            i++;
          }
          break;
        case "x":
          // Handle \xXX
          if (i + 3 < str.length) {
            const hexCode = str.substring(i + 2, i + 4);
            if (/^[0-9a-fA-F]{2}$/.test(hexCode)) {
              result += String.fromCharCode(parseInt(hexCode, 16));
              i += 4;
            } else {
              result += str[i];
              i++;
            }
          } else {
            result += str[i];
            i++;
          }
          break;
        default:
          // Unknown escape, keep as-is
          result += str[i];
          i++;
      }
    } else {
      result += str[i];
      i++;
    }
  }

  return result;
}

function countEscapedCharacters(str: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    if (
      char === "\\" ||
      char === "\n" ||
      char === "\r" ||
      char === "\t" ||
      char === "\b" ||
      char === "\f" ||
      char === "\"" ||
      char === "'" ||
      code < 32 ||
      code > 126
    ) {
      count++;
    }
  }
  return count;
}

// Export for convenience
export default { encode, decode };
