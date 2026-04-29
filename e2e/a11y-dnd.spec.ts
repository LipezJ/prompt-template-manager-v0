import { test, expect, type Page } from "@playwright/test"

const SAMPLE_PROJECTS = [
  {
    id: "default",
    name: "Mi Primer Proyecto",
    promptSets: [
      {
        id: "set1",
        name: "smoke set",
        variables: [],
        prompts: [{ id: "prompt1", content: "hola" }],
        uiPreferences: { splitPosition: 50, variablesPanelVisible: true, cardView: false },
      },
      {
        id: "set2",
        name: "otro set",
        variables: [],
        prompts: [{ id: "prompt2", content: "chao" }],
      },
    ],
  },
]

function captureFatalErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`))
  return errors
}

async function seedProjects(page: Page, projects: unknown) {
  await page.addInitScript((data) => {
    window.localStorage.setItem("projects", JSON.stringify(data))
  }, projects)
}

test.describe("a11y: drag and drop", () => {
  test("grip handles expose aria-label and live region announces drag state", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await seedProjects(page, SAMPLE_PROJECTS)
    await page.goto("/projects/default")
    await page.waitForLoadState("networkidle")

    // Enter edit mode so the grip handles render.
    await page.getByRole("button", { name: /reordenar elementos/i }).click()

    const handles = page.getByRole("button", { name: /reordenar conjunto/i })
    await expect(handles.first()).toBeVisible()
    expect(await handles.count()).toBeGreaterThanOrEqual(2)

    // dnd-kit injects a hidden aria-live region on mount with id starting with "DndLiveRegion".
    const dndLive = page.locator('[id^="DndLiveRegion"]')
    await expect(dndLive).toHaveCount(1)

    // Activate keyboard drag: focus first grip, Space to pick, ArrowDown, Space to drop.
    await handles.first().focus()
    await page.keyboard.press("Space")
    // Some announcement from our dndAnnouncements should land in the dnd live region.
    await expect(dndLive).toContainText(/Tomado|encima/i, { timeout: 2000 })

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Space")
    await expect(dndLive).toContainText(/soltado|cancelado/i, { timeout: 2000 })

    expect(errors, errors.join("\n")).toHaveLength(0)
  })
})
