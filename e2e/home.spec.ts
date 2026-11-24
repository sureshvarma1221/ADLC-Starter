import { expect, test } from "@playwright/test";

test("home page shows the four lifecycle steps", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Agentic SDLC starter" })).toBeVisible();
  for (const id of ["spec", "build", "ship", "deploy"]) {
    await expect(page.getByTestId(`step-${id}`)).toBeVisible();
  }
});
