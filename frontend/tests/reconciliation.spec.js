import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Reconciliación y Reportes', () => {

  test.beforeEach(async ({ page }) => {
    resetDatabase();

    // 1. Ir a Kiosk y simular ENTRADA de Admin pero sin Salida.
    // Esto es necesario para tener algún dato en los reportes
    await page.goto('/kiosk');
    await page.fill('input[placeholder="70010010"]', '00000000');
    // Forzamos registro de entrada (admin)
    await page.click('button:has-text("REGISTRAR ENTRADA")');
    await expect(page.locator('.bg-green-100')).toBeVisible();

    // 2. Login as admin for Reports
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Debería visualizar la entrada en reportes y permitir editarla (Reconciliación manual)', async ({ page }) => {
    // Ir a reportes
    await page.goto('/reports');
    await expect(page.locator('h2', { hasText: 'Reportes de Asistencia' })).toBeVisible();

    // Validar que hay un registro en la tabla con "Admin"
    const adminRow = page.locator('tr', { hasText: 'Admin' }).first();
    await expect(adminRow).toBeVisible();
    
    // Verificamos que la Salida diga '—' (columna 3: Personal, Fecha, Entrada, Salida)
    await expect(adminRow.locator('td').nth(3)).toContainText('—');

    // EDICIÓN MANUAL
    await adminRow.locator('button[title="Editar"]').click();
    
    const modal = page.locator('div.fixed.z-50');
    await expect(modal).toBeVisible();
    
    // Configurar Salida (20:00) — segundo input type="time"
    await modal.locator('input[type="time"]').nth(1).fill('20:00');
    
    // Configurar Justificación — segundo select en modal (first is Estado)
    await modal.locator('select').nth(1).selectOption({ value: 'olvido_salida' });
    
    // Guardar
    await modal.locator('button', { hasText: 'Guardar' }).click();

    // Validar que la tabla se actualizó y ahora marca 20:00
    await expect(adminRow.locator('td').nth(3)).toContainText('20:00');
    await expect(adminRow).toContainText('olvido_salida');
  });

  test('Debería poder ejecutar auto-cierre de jornadas (Cerrar Día)', async ({ page }) => {
    // Ir a reportes
    await page.goto('/reports');
    await expect(page.locator('h2', { hasText: 'Reportes de Asistencia' })).toBeVisible();

    // Escuchar el confirm() dialog del navegador y aceptarlo
    page.once('dialog', dialog => dialog.accept());
    
    await page.click('button:has-text("Cerrar Día")');

    // Escuchar el alert() que muestra resultado
    page.once('dialog', dialog => dialog.dismiss());

    // Sleep to allow post-request alert to show and be dismissed
    await page.waitForTimeout(2000);

    // Verificar que no hubo crash y seguimos en reportes
    await expect(page.locator('h2', { hasText: 'Reportes de Asistencia' })).toBeVisible();
  });

});
