import { describe, expect, it } from "vitest"
import {
  extractVariableRefs,
  getMissingRequiredVariables,
  replaceVariables,
} from "@/lib/prompt-utils"
import type { PromptVariable } from "@/types/prompt"

const v = (name: string, value: string, extra: Partial<PromptVariable> = {}): PromptVariable => ({
  id: `var-${name}`,
  name,
  value,
  ...extra,
})

describe("replaceVariables", () => {
  it("replaces a single placeholder", () => {
    expect(replaceVariables("Hola {name}", [v("name", "Juan")])).toBe("Hola Juan")
  })

  it("replaces multiple occurrences of the same placeholder", () => {
    expect(replaceVariables("{x} y {x}", [v("x", "uno")])).toBe("uno y uno")
  })

  it("supports both {name} and {{name}} as variable refs", () => {
    expect(replaceVariables("{name} y {{name}}", [v("name", "Juan")])).toBe("Juan y Juan")
  })

  it("ignores names with non-identifier characters", () => {
    expect(replaceVariables("[{a.b}]", [v("a.b", "ok")])).toBe("[{a.b}]")
    expect(replaceVariables("[{x+y}]", [v("x+y", "ok")])).toBe("[{x+y}]")
  })

  it("leaves unknown placeholders untouched", () => {
    expect(replaceVariables("Hola {desconocido}", [v("name", "Juan")])).toBe("Hola {desconocido}")
  })

  it("does not match unbalanced braces", () => {
    expect(replaceVariables("{{name}", [v("name", "Juan")])).toBe("{{name}")
    expect(replaceVariables("{name}}", [v("name", "Juan")])).toBe("{name}}")
  })

  it("handles empty text and empty variables", () => {
    expect(replaceVariables("", [v("name", "Juan")])).toBe("")
    expect(replaceVariables("Hola {name}", [])).toBe("Hola {name}")
  })

  it("uses the value of select variables as-is", () => {
    const variable = v("mode", "expert", {
      type: "select",
      options: [
        { id: "1", label: "Experto", value: "expert" },
        { id: "2", label: "Principiante", value: "beginner" },
      ],
    })
    expect(replaceVariables("Mode: {mode}", [variable])).toBe("Mode: expert")
  })
})

describe("extractVariableRefs", () => {
  it("returns names referenced as {name} or {{name}}", () => {
    const refs = extractVariableRefs("{a} text {{b}} {a} {{c}}")
    expect(refs).toEqual(new Set(["a", "b", "c"]))
  })

  it("ignores invalid identifiers and unbalanced braces", () => {
    const refs = extractVariableRefs("{a.b} {{x}} {y}}")
    expect(refs).toEqual(new Set(["x"]))
  })
})

describe("getMissingRequiredVariables", () => {
  it("returns required vars referenced in the prompt that are empty", () => {
    const vars = [
      v("a", ""),
      v("b", "ok"),
      v("c", "", { optional: true }),
      v("d", ""),
    ]
    const missing = getMissingRequiredVariables("Use {a} and {{b}} and {c}", vars)
    expect(missing.map((m) => m.name)).toEqual(["a"])
  })

  it("ignores required vars not referenced in the prompt", () => {
    const vars = [v("a", ""), v("unused", "")]
    const missing = getMissingRequiredVariables("Use {a}", vars)
    expect(missing.map((m) => m.name)).toEqual(["a"])
  })

  it("returns empty when nothing is missing", () => {
    const vars = [v("a", "x"), v("b", "y")]
    expect(getMissingRequiredVariables("{a} {b}", vars)).toEqual([])
  })
})
