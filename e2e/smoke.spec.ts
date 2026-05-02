import { test, expect, type Page } from "@playwright/test"

function captureFatalErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`))
  return errors
}

test("home page renders the project grid", async ({ page }) => {
  const errors = captureFatalErrors(page)
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await expect(page.locator("body")).toBeVisible()
  await expect(page.getByRole("heading").first()).toBeVisible()
  expect(errors, errors.join("\n")).toHaveLength(0)
})

test("project page renders the seeded project dashboard", async ({ page }) => {
  const errors = captureFatalErrors(page)
  await page.goto("/projects/default")
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByText("Prompt sets").first()).toBeVisible()
  await expect(page.getByText("Conjuntos de Prompts").first()).toBeVisible()
  expect(errors, errors.join("\n")).toHaveLength(0)
})

test("prompt-sets page renders variables and prompts areas", async ({ page }) => {
  const errors = captureFatalErrors(page)
  await page.goto("/projects/default/prompt-sets")
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { name: "Variables" }).first()).toBeVisible()
  await expect(page.getByRole("heading", { name: "Prompts" })).toBeVisible()
  expect(errors, errors.join("\n")).toHaveLength(0)
})

test("navigation between routes does not break", async ({ page }) => {
  const errors = captureFatalErrors(page)
  await page.goto("/projects/default")
  await page.waitForLoadState("networkidle")
  await page.goto("/projects/default/prompt-sets")
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { name: "Variables" }).first()).toBeVisible()
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveURL("/")
  await expect(page.locator("body")).toBeVisible()
  expect(errors, errors.join("\n")).toHaveLength(0)
})
