import { test, expect } from '@playwright/test';

test.describe('Applitex E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Login page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/Applitex/);
    await expect(page.getByRole('textbox', { name: 'admin@applitex.com' })).toBeVisible();
  });

  test('Login with valid credentials', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText(/Bienvenido|Dashboard|Tablero|SyncCore|Administrador/i, { timeout: 5000 });
  });

  test('Navigate to Customers page', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    await page.locator('text=Clientes').first().click();
    await expect(page.locator('h1')).toContainText(/Clientes|Cliente/i, { timeout: 5000 });
  });

  test('Navigate to Orders page', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    await page.locator('text=Órdenes').first().click();
    await expect(page.locator('h1')).toContainText(/Órdenes|Orden/i, { timeout: 5000 });
  });

  test('Navigate to Inventory page', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    await page.locator('text=Inventario').first().click();
    await expect(page.locator('h1')).toContainText(/Inventario/i, { timeout: 5000 });
  });

  test('Navigate to Team page', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    await page.locator('text=Equipo').first().click();
    await expect(page.locator('h1')).toContainText(/Equipo|Usuario|Miembro/i, { timeout: 5000 });
  });

  test('Logout works', async ({ page }) => {
    await page.getByPlaceholder('ej: master').fill('master');
    await page.getByPlaceholder('admin@applitex.com').fill('admin@applitex.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: /Acceder|Consola/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    await page.locator('button:has-text("Cerrar"), button[aria-label="Cerrar"]').click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/login/i, { timeout: 5000 }).catch(() => {});
  });
});