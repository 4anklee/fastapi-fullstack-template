import { expect, test } from "@playwright/test";
import { createUser } from "./utils/private-api";
import { randomEmail, randomPassword } from "./utils/random";
import { logInUser } from "./utils/user";

test("Mobile navigation closes after selecting a page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle sidebar" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const navigation = page.getByRole("dialog", { name: "Navigation" });
    await expect(navigation).toBeVisible();
    await navigation.getByRole("link", { name: "Items", exact: true }).click();
    await expect(page).toHaveURL(/\/items$/);
    await expect(navigation).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Items" })).toBeVisible();
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
});

test("Dialogs support keyboard dismissal and restore trigger focus", async ({
    page,
}) => {
    await page.goto("/items");
    const add = page.getByRole("button", { name: "Add Item" });
    await add.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Add Item" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(add).toBeFocused();
});

test.describe("Table pagination", () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test("Page size and navigation show the correct records", async ({
        page,
        request,
    }) => {
        const email = randomEmail();
        const password = randomPassword();
        await createUser({ email, password });
        await logInUser(page, email, password);
        const token = await page.evaluate(() =>
            localStorage.getItem("access_token"),
        );
        const apiUrl =
            process.env.VITE_API_URL ||
            process.env.PLAYWRIGHT_BASE_URL ||
            "http://localhost:8000";
        for (let index = 0; index < 12; index++) {
            const response = await request.post(`${apiUrl}/api/v1/items/`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { title: `Pagination item ${index}` },
            });
            expect(response.ok()).toBe(true);
        }
        await page.goto("/items");
        await expect(page.getByRole("row")).toHaveCount(11);
        await page.getByRole("button", { name: "Go to next page" }).click();
        await expect(page.getByRole("row")).toHaveCount(3);
        await expect(page.getByText("Page 2 of 2")).toBeVisible();
        await page.getByRole("button", { name: "Rows per page" }).click();
        await page.getByRole("option", { name: "5", exact: true }).click();
        await expect(page.getByText("Page 1 of 3")).toBeVisible();
        await expect(page.getByRole("row")).toHaveCount(6);
        await page.getByRole("button", { name: "Go to last page" }).click();
        await expect(page.getByRole("row")).toHaveCount(3);
        await expect(
            page.getByRole("button", { name: "Go to next page" }),
        ).toBeDisabled();
    });
});

test("Collapsed desktop navigation remains usable and supports the keyboard shortcut", async ({
    page,
}) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle sidebar" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("link", { name: "Items", exact: true }).click();
    await expect(page).toHaveURL(/\/items$/);
    await page.getByTestId("user-menu").click();
    await page.getByRole("menuitem", { name: "User Settings" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.keyboard.press("Control+b");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("Mobile account menu closes the drawer when opening settings", async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await page.getByTestId("user-menu").click();
    await page.getByRole("menuitem", { name: "User Settings" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(
        page.getByRole("dialog", { name: "Navigation" }),
    ).not.toBeVisible();
    await expect(
        page.getByRole("heading", { name: "User Settings" }),
    ).toBeVisible();
});
