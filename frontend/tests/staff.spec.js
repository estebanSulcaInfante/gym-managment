import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Gestión de Personal (Staff CRM)', () => {

  test.beforeEach(async ({ page }) => {
    resetDatabase();
    
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Debería permitir crear un empleado nuevo, editarlo y desactivarlo', async ({ page }) => {
    // 1. Ir a Staff 
    await page.goto('/staff');
    await expect(page.locator('h1', { hasText: 'Staff Management' })).toBeVisible();

    // 2. CREACIÓN
    await page.click('button:has-text("Add Employee")');
    // Rellenamos Modal
    await page.fill('input[name="nombre"]', 'E2E');
    await page.fill('input[name="apellido"]', 'Tester');
    await page.fill('input[name="dni"]', '77777777');
    await page.fill('input[name="telefono"]', '999888777');
    await page.selectOption('select[name="cargo"]', 'Entrenador');
    await page.click('button:has-text("Crear")');

    // 3. LECTURA (Verificar que aparece en tabla)
    const newEmployeeRow = page.locator('tr', { hasText: '77777777' });
    await expect(newEmployeeRow).toBeVisible();
    await expect(newEmployeeRow).toContainText('E2E Tester');
    await expect(newEmployeeRow).toContainText('Entrenador');
    await expect(newEmployeeRow).toContainText('Active');

    // 4. EDICIÓN
    await newEmployeeRow.locator('button[title="Edit"]').click();
    // Cambiar rol y nombre
    await page.fill('input[name="nombre"]', 'E2E NuevoNombre');
    await page.selectOption('select[name="cargo"]', 'Gerente');
    await page.click('button:has-text("Guardar")');

    // Validar Edición
    await expect(newEmployeeRow).toContainText('E2E NuevoNombre');
    await expect(newEmployeeRow).toContainText('Gerente');

    // 5. DESACTIVACIÓN (Soft Delete)
    // Escuchar evento alert de confirm() de JS y aceptarlo automáticamente
    page.once('dialog', dialog => dialog.accept());
    
    await newEmployeeRow.locator('button[title="Deactivate"]').click();

    // Volver a revisar la fila, el status debería ser Inactive
    await expect(newEmployeeRow.locator('span', { hasText: 'Inactive' })).toBeVisible();
  });

});
