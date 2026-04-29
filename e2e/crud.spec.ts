import { test, expect, type Page } from "@playwright/test"

const SAMPLE_PROJECTS = [
  {
    id: "default",
    name: "Mi Primer Proyecto",
    promptSets: [
      {
        id: "set1",
        name: "smoke set",
        variables: [
          { id: "var-greet", name: "greet", value: "Hola" },
          { id: "var-name", name: "name", value: "Juan" },
        ],
        prompts: [{ id: "prompt1", content: "{greet}, {name}!" }],
        uiPreferences: { splitPosition: 50, variablesPanelVisible: true, cardView: false },
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

test.describe("crud and persistence", () => {
  test("seeded projects render variables and raw prompt content", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await seedProjects(page, SAMPLE_PROJECTS)
    await page.goto("/projects/default/prompt-sets")
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("button", { name: "smoke set" })).toBeVisible()
    await expect(page.getByText("greet", { exact: true })).toBeVisible()
    await expect(page.getByText("name", { exact: true })).toBeVisible()
    await expect(page.getByText("{greet}, {name}!").first()).toBeVisible()

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("preview mode replaces variables in prompt content", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await seedProjects(page, SAMPLE_PROJECTS)
    await page.goto("/projects/default/prompt-sets")
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Preview" }).first().click()
    await expect(page.getByText("Hola, Juan!")).toBeVisible()

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("persisted shape is preserved after a page load", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await seedProjects(page, SAMPLE_PROJECTS)
    await page.goto("/projects/default/prompt-sets")
    await page.waitForLoadState("networkidle")

    // After migration, data lives in IDB (legacy LS key is cleared).
    const parsed = (await page.evaluate(async () => {
      const req = indexedDB.open("keyval-store")
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
      const store = db.transaction("keyval", "readonly").objectStore("keyval")
      const value = await new Promise((resolve, reject) => {
        const r = store.get("projects")
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      })
      db.close()
      return value
    })) as typeof SAMPLE_PROJECTS

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({ id: "default", name: "Mi Primer Proyecto" })
    expect(parsed[0].promptSets).toHaveLength(1)
    expect(parsed[0].promptSets[0]).toMatchObject({ id: "set1", name: "smoke set" })
    expect(parsed[0].promptSets[0].variables).toEqual(SAMPLE_PROJECTS[0].promptSets[0].variables)
    expect(parsed[0].promptSets[0].prompts).toEqual(SAMPLE_PROJECTS[0].promptSets[0].prompts)
    expect(parsed[0].promptSets[0].uiPreferences).toEqual(SAMPLE_PROJECTS[0].promptSets[0].uiPreferences)

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("multiple prompt sets render as separate tabs", async ({ page }) => {
    const errors = captureFatalErrors(page)
    const projectsWithExtra = [
      {
        ...SAMPLE_PROJECTS[0],
        promptSets: [
          ...SAMPLE_PROJECTS[0].promptSets,
          {
            id: "set-imported",
            name: "imported set",
            variables: [],
            prompts: [{ id: "p1", content: "imported content" }],
          },
        ],
      },
    ]
    await seedProjects(page, projectsWithExtra)
    await page.goto("/projects/default/prompt-sets")
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("button", { name: "smoke set" })).toBeVisible()
    await expect(page.getByRole("button", { name: "imported set" })).toBeVisible()

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("corrupted legacy localStorage does not crash the app", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await page.addInitScript(() => {
      window.localStorage.setItem("projects", '{"this": "is not an array"}')
    })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    expect(errors, errors.join("\n")).toHaveLength(0)
    const backupKey = await page.evaluate(() =>
      Object.keys(window.localStorage).find((k) => k.startsWith("projects.corrupt.")),
    )
    expect(backupKey, "expected a backup of the corrupted blob").toBeTruthy()
    // The migration path also clears the bad legacy key.
    const stillThere = await page.evaluate(() => window.localStorage.getItem("projects"))
    expect(stillThere).toBeNull()
  })

  test("legacy localStorage is migrated to IndexedDB on first load", async ({ page }) => {
    const errors = captureFatalErrors(page)
    await seedProjects(page, SAMPLE_PROJECTS)
    await page.goto("/projects/default/prompt-sets")
    await page.waitForLoadState("networkidle")

    // After load, the legacy key should be gone and IDB should hold the data.
    const lsAfter = await page.evaluate(() => window.localStorage.getItem("projects"))
    expect(lsAfter).toBeNull()

    const idbAfter = await page.evaluate(async () => {
      const req = indexedDB.open("keyval-store")
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
      const store = db.transaction("keyval", "readonly").objectStore("keyval")
      const value = await new Promise((resolve, reject) => {
        const r = store.get("projects")
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      })
      db.close()
      return value
    })
    expect(idbAfter).toEqual(SAMPLE_PROJECTS)

    expect(errors, errors.join("\n")).toHaveLength(0)
  })
})
