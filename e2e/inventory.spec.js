const { test, expect } = require("@playwright/test");

test.describe("Stock & Inventory Management E2E Flow", () => {
  const testMachine = `M-${Date.now()}`;

  test("admin end-to-end CRUD flow", async ({ page }) => {
    test.setTimeout(65000);
    // 1. Visit Home and check public layout
    await page.goto("/");
    await expect(page.locator("text=Warehouse Inventory")).toBeVisible();

    // 2. Go to /admin and check it redirects to login
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("text=Admin Portal")).toBeVisible();

    // 3. Perform Admin Login
    await page.fill('input[placeholder="admin@example.com"]', "admin@example.com");
    await page.fill('input[placeholder="Password"]', "AdminSecurePassword123!");
    await page.click('button:has-text("Sign In")');

    // Should redirect to admin page
    await page.waitForURL(/\/admin/);
    await expect(page.locator("text=Admin Stock Management")).toBeVisible();

    // 4. Create a new Stock Item
    await page.click('button:has-text("Add New Record")');
    await page.waitForURL(/\/admin\/new/);
    
    // Fill the fields
    await page.fill('input[placeholder="Enter machine name or category"]', testMachine);
    await page.fill('input[placeholder="e.g. Aisle 3, Shelf B"]', "Aisle E2E");
    await page.fill('textarea[placeholder="Provide details of material composition, structure etc."]', "Specially created material for E2E tests");

    // Click save
    await page.click('button:has-text("Save Record")');

    // Should return to admin dashboard with success message
    await page.waitForURL(/\/admin/);
    await expect(page.locator("text=Inventory item created successfully!")).toBeVisible();

    // 5. Search for the item to check it displays
    await page.fill('input[placeholder*="Search items by machine"]', testMachine);
    await page.press('input[placeholder*="Search items by machine"]', "Enter");
    
    await expect(page.locator(`text=${testMachine}`)).toBeVisible();

    // 6. Edit item
    // Antd Actions column: Click the edit link directly
    // There only exists 1 matching row because we searched by unique testMachine
    await page.locator(`.ant-table-row:has-text("${testMachine}") a[href*="/edit"]`).click();
    await page.waitForURL(/\/admin\/.*\/edit/);
    await expect(page.locator("text=Edit Inventory Item")).toBeVisible({ timeout: 15000 });

    await page.click('button:has-text("Save Record")');

    // Verifies edit completes
    await page.waitForURL(/\/admin/);
    await expect(page.locator("text=Inventory item updated successfully!")).toBeVisible();

    // 7. Delete item via multi-select confirmation
    await page.fill('input[placeholder*="Search items by machine"]', testMachine);
    await page.press('input[placeholder*="Search items by machine"]', "Enter");

    // Select matching row checkbox
    await page.locator(`.ant-table-row:has-text("${testMachine}") input[type="checkbox"]`).click();

    // Click "Delete Selected (1)" bulk trigger
    const bulkDeleteBtn = page.locator('button:has-text("Delete Selected (1)")');
    await expect(bulkDeleteBtn).toBeVisible();
    await bulkDeleteBtn.click();

    // Click Yes confirming Popconfirm
    await page.locator('.ant-popover button:has-text("Yes")').click();

    // Check successful notice
    await expect(page.locator("text=items deleted successfully")).toBeVisible();
  });
});
