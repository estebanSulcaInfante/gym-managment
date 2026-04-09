import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Kiosko de Asistencia', () => {

  test.beforeEach(async () => {
    // Restauramos DB
    resetDatabase();
  });

  test('Debería permitir registrar entrada a un empleado válido y atrapar intento doble', async ({ page }) => {
    await page.goto('/kiosk');

    // Mover a entrada (por defecto ya está)
    const btnEntrada = page.locator('button', { hasText: 'ENTRADA' }).first();
    await btnEntrada.click();

    // DNI Admin (creado en reset_test_db: 00000000)
    await page.fill('input[placeholder="70010010"]', '00000000');
    
    // Registrar
    await page.click('button:has-text("REGISTRAR ENTRADA")');

    // Verificar éxito (Aparece recuadro verde)
    const successMsg = page.locator('.bg-green-100');
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toContainText('Entrada:');

    // Intentar registrar de nuevo el mismo DNI (DEBERÍA FALLAR porque ya marcó)
    await page.fill('input[placeholder="70010010"]', '00000000');
    await page.click('button:has-text("REGISTRAR ENTRADA")');
    
    // Debería salir error "Ya tiene una entrada" o similar
    const errorMsg = page.locator('.bg-red-100');
    await expect(errorMsg).toBeVisible();
  });

  test('Debería denegar entrada con DNI inexistente', async ({ page }) => {
    await page.goto('/kiosk');
    await page.fill('input[placeholder="70010010"]', '99999999');
    await page.click('button:has-text("REGISTRAR ENTRADA")');

    const errorMsg = page.locator('.bg-red-100');
    await expect(errorMsg).toBeVisible({ timeout: 15000 });
    await expect(errorMsg).toContainText('Empleado no encontrado');
  });

  test('Debería permitir registrar salida solo después de haber hecho entrada', async ({ page }) => {
    await page.goto('/kiosk');

    // ------ ENTRADA ------
    await page.fill('input[placeholder="70010010"]', '11111111'); // Recep DNI
    await page.click('button:has-text("REGISTRAR ENTRADA")');
    
    // Esperar a que el tooltip o mensaje de exito desaparezca o simplemente continuar.
    const successMsgEntrada = page.locator('.bg-green-100');
    await expect(successMsgEntrada).toBeVisible({ timeout: 15000 });
    
    // Esperar a que desaparezca para que el timer de 5s no interfiera con el siguiente
    await expect(successMsgEntrada).not.toBeVisible({ timeout: 10000 });

    // ------ SALIDA ------
    // Cambiar a Tab Salida
    const btnTabSalida = page.locator('button', { hasText: 'SALIDA' }).first();
    await btnTabSalida.click();

    await page.fill('input[placeholder="70010010"]', '11111111');
    await page.click('button:has-text("REGISTRAR SALIDA")');

    // Éxito de salida
    const successMsg = page.locator('.bg-green-100');
    // .bg-green-100 se renderiza cuando success
    await expect(successMsg).toBeVisible({ timeout: 15000 });
    await expect(successMsg).toContainText('Salida:');
  });

});
