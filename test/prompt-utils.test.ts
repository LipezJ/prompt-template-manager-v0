import { describe, expect, it } from "vitest"
import { replaceVariables } from "@/lib/prompt-utils"
import type { PromptVariable } from "@/types/prompt"

const v = (name: string, value: string): PromptVariable => ({ id: `var-${name}`, name, value })

describe("replaceVariables", () => {
  it("replaces a single placeholder", () => {
    expect(replaceVariables("Hola {name}", [v("name", "Juan")])).toBe("Hola Juan")
  })

  it("replaces multiple occurrences of the same placeholder", () => {
    expect(replaceVariables("{x} y {x}", [v("x", "uno")])).toBe("uno y uno")
  })

  it("escapes regex metacharacters in variable names", () => {
    expect(replaceVariables("[{a.b}]", [v("a.b", "ok")])).toBe("[ok]")
    expect(replaceVariables("[{x+y}]", [v("x+y", "ok")])).toBe("[ok]")
    expect(replaceVariables("[{a*b}]", [v("a*b", "ok")])).toBe("[ok]")
  })

  it("does not match a different name with regex-similar characters", () => {
    // Without regex escaping, '.' would match any char. With escaping, "{aXb}" stays literal.
    expect(replaceVariables("{aXb}", [v("a.b", "ok")])).toBe("{aXb}")
  })

  it("leaves unknown placeholders untouched", () => {
    expect(replaceVariables("Hola {desconocido}", [v("name", "Juan")])).toBe("Hola {desconocido}")
  })

  it("handles empty text and empty variables", () => {
    expect(replaceVariables("", [v("name", "Juan")])).toBe("")
    expect(replaceVariables("Hola {name}", [])).toBe("Hola {name}")
  })

  it("applies replacements in array order", () => {
    expect(replaceVariables("{a}{b}", [v("a", "1"), v("b", "2")])).toBe("12")
  })
})
