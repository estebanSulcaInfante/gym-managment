import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Protección contra Cambio de Horario', () => {

  test.beforeEach(async ({ page }) => {
    resetDatabase();
  });

  test('Registrar entrada debe guardar snapshot del horario vigente', async ({ page }) => {
    // 1. Registrar entrada vía kiosk (admin, DNI 00000000)
    await page.goto('/kiosk');
    await page.fill('input[placeholder="70010010"]', '00000000');
    await page.click('button:has-text("REGISTRAR ENTRADA")');
    await expect(page.locator('.bg-green-100')).toBeVisible();

    // 2. Login as admin
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 3. Ir a reportes y verificar el registro
    await page.goto('/reports');
    await expect(page.locator('h2', { hasText: 'Reportes de Asistencia' })).toBeVisible();

    const adminRow = page.locator('tr', { hasText: 'Admin' }).first();
    await expect(adminRow).toBeVisible();

    // 4. Verificar que el registro tiene un estado válido (puntual o retraso)  
    const estadoSpan = adminRow.locator('span.rounded-full').first();
    await expect(estadoSpan).toBeVisible();
    const estadoText = await estadoSpan.textContent();
    expect(['Puntual', 'Retraso', 'Fuera de turnoAuto-Cierre'].some(s => estadoText.includes(s.substring(0,4)))).toBeTruthy();

    // 5. Ahora ir a Staff y editar el horario del admin
    await page.goto('/staff');
    await expect(page.locator('h1', { hasText: 'Staff Management' })).toBeVisible();

    // Buscar la fila del admin y hacer click en Edit
    const adminStaffRow = page.locator('tr', { hasText: '00000000' });
    await expect(adminStaffRow).toBeVisible();
    await adminStaffRow.locator('button[title="Edit"]').click();

    // Esperar modal (HeadlessUI Dialog.Panel)
    const modal = page.locator('.max-w-3xl.rounded-2xl');
    await expect(modal).toBeVisible();

    // Cambiar la hora de entrada del Lunes (primer time input en el grid de horarios)
    // Los horarios están en un grid con inputs de tipo time
    const timeInputs = modal.locator('input[type="time"]');
    // Primera entrada es Lunes Entrada, segunda es Lunes Salida
    await timeInputs.nth(0).fill('05:00');  // Cambiar entrada de Lunes a 05:00
    await timeInputs.nth(1).fill('23:00');  // Cambiar salida de Lunes a 23:00
    
    // Guardar
    await modal.locator('button:has-text("Guardar")').click();

    // Esperar que el modal se cierre
    await expect(modal).not.toBeVisible();

    // 6. Volver a reportes y verificar que el registro de hoy NO cambió
    await page.goto('/reports');
    await expect(page.locator('h2', { hasText: 'Reportes de Asistencia' })).toBeVisible();

    const adminRowAfter = page.locator('tr', { hasText: 'Admin' }).first();
    await expect(adminRowAfter).toBeVisible();

    // El estado debe seguir siendo el mismo (no debe haber cambiado por la edición de horario)
    const estadoSpanAfter = adminRowAfter.locator('span.rounded-full').first();
    const estadoTextAfter = await estadoSpanAfter.textContent();
    
    // El estado original (guardado como snapshot) debe persistir
    expect(estadoText).toBe(estadoTextAfter);
  });

});
