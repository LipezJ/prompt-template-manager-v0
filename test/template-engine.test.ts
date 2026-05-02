import { describe, expect, it } from "vitest"
import { getActiveVariableRefs, renderPrompt } from "@/lib/template-engine"
import { getMissingRequiredVariables } from "@/lib/prompt-utils"
import type { PromptVariable } from "@/types/prompt"

const v = (name: string, value: string, extra: Partial<PromptVariable> = {}): PromptVariable => ({
  id: `var-${name}`,
  name,
  value,
  ...extra,
})

describe("renderPrompt — variables", () => {
  it("renders {name} and {{name}} alike", () => {
    expect(renderPrompt("{a} y {{a}}", [v("a", "ok")])).toBe("ok y ok")
  })

  it("renders boolean by literal value", () => {
    const flag = v("flag", "true", { type: "boolean" })
    expect(renderPrompt("flag={flag}", [flag])).toBe("flag=true")
  })

  it("renders select using its current value", () => {
    const variable = v("mode", "expert", {
      type: "select",
      options: [
        { id: "1", label: "Experto", value: "expert" },
        { id: "2", label: "Beginner", value: "beginner" },
      ],
    })
    expect(renderPrompt("Mode: {mode}", [variable])).toBe("Mode: expert")
  })

  it("keeps unknown refs literal", () => {
    expect(renderPrompt("Hi {desconocida}", [v("a", "1")])).toBe("Hi {desconocida}")
  })

  it("treats {{else}} and {{if}} as plain refs (only #else / #if name are control tags)", () => {
    expect(renderPrompt("{{else}} {{if}}", [v("else", "X"), v("if", "Y")])).toBe("X Y")
  })
})

describe("renderPrompt — conditionals", () => {
  it("renders consequent when guard is truthy", () => {
    expect(renderPrompt("{{#if a}}yes{{/if}}", [v("a", "x")])).toBe("yes")
  })

  it("skips consequent when guard is falsy", () => {
    expect(renderPrompt("{{#if a}}yes{{/if}}", [v("a", "")])).toBe("")
  })

  it("renders alternative on else when guard is falsy", () => {
    expect(renderPrompt("{{#if a}}A{{#else}}B{{/if}}", [v("a", "")])).toBe("B")
  })

  it("uses boolean truthiness for boolean variables", () => {
    const flag = (val: string) => v("flag", val, { type: "boolean" })
    expect(renderPrompt("{{#if flag}}on{{#else}}off{{/if}}", [flag("true")])).toBe("on")
    expect(renderPrompt("{{#if flag}}on{{#else}}off{{/if}}", [flag("false")])).toBe("off")
  })

  it("supports nested conditionals", () => {
    const tpl = "{{#if a}}A{{#if b}}/B{{/if}}{{/if}}"
    expect(renderPrompt(tpl, [v("a", "x"), v("b", "x")])).toBe("A/B")
    expect(renderPrompt(tpl, [v("a", "x"), v("b", "")])).toBe("A")
    expect(renderPrompt(tpl, [v("a", ""), v("b", "x")])).toBe("")
  })

  it("falls back to plain substitution on malformed template", () => {
    expect(renderPrompt("{{#if a}}only-open {a}", [v("a", "ok")])).toBe("only-open ok")
  })
})

describe("renderPrompt — whitespace control", () => {
  it("eats the surrounding line when a control tag is alone on its line", () => {
    const tpl = "Line 1\n{{#if a}}\ncontent\n{{/if}}\nLine 5"
    expect(renderPrompt(tpl, [v("a", "x")])).toBe("Line 1\ncontent\nLine 5")
    expect(renderPrompt(tpl, [v("a", "")])).toBe("Line 1\nLine 5")
  })

  it("preserves whitespace when a control tag is inline with other content", () => {
    expect(renderPrompt("hi {{#if a}}there{{/if}}!", [v("a", "x")])).toBe("hi there!")
    expect(renderPrompt("hi {{#if a}}there{{/if}}!", [v("a", "")])).toBe("hi !")
  })
})

describe("getActiveVariableRefs", () => {
  it("collects refs in rendered branches only", () => {
    const tpl = "{{#if a}}{b}{{#else}}{c}{{/if}}"
    expect(getActiveVariableRefs(tpl, [v("a", "x"), v("b", ""), v("c", "")])).toEqual(new Set(["b"]))
    expect(getActiveVariableRefs(tpl, [v("a", ""), v("b", ""), v("c", "")])).toEqual(new Set(["c"]))
  })

  it("does not count an if-guard variable as a render-position reference", () => {
    const refs = getActiveVariableRefs("{{#if mode}}Use {tool}{{/if}}", [
      v("mode", ""),
      v("tool", ""),
    ])
    expect(refs).toEqual(new Set())
  })
})

describe("getMissingRequiredVariables — AST-aware", () => {
  it("does not flag a required var that is hidden behind a falsy if", () => {
    const tpl = "{{#if mode}}{tool}{{/if}}"
    const vars = [v("mode", ""), v("tool", "")]
    expect(getMissingRequiredVariables(tpl, vars)).toEqual([])
  })

  it("flags a required var that is rendered through a truthy if", () => {
    const tpl = "{{#if mode}}{tool}{{/if}}"
    const vars = [v("mode", "go"), v("tool", "")]
    const missing = getMissingRequiredVariables(tpl, vars)
    expect(missing.map((m) => m.name)).toEqual(["tool"])
  })

  it("treats the if-guard variable as not-required by itself", () => {
    const tpl = "{{#if mode}}fixed text{{/if}}"
    const vars = [v("mode", "")]
    expect(getMissingRequiredVariables(tpl, vars)).toEqual([])
  })
})
