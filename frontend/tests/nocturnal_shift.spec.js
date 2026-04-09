import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Arquitectura de Jornadas Complejas', () => {

  test.beforeEach(async ({ page }) => {
    resetDatabase();
    
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Debería poder crear y editar un empleado con turno partido y turno nocturno', async ({ page }) => {
    // 1. Ir a Staff 
    await page.goto('/staff');
    await expect(page.locator('h1', { hasText: 'Staff Management' })).toBeVisible();

    // 2. CREACIÓN de Empleado
    await page.click('button:has-text("Add Employee")');
    await page.fill('input[name="nombre"]', 'Batman');
    await page.fill('input[name="apellido"]', 'Nocturno');
    await page.fill('input[name="dni"]', '99991111');
    await page.selectOption('select[name="cargo"]', 'Limpieza');

    // Ubicamos el contenedor del día Lunes (índice 0)
    // En el Modal, cada día tiene su bloque. Lunes dice "Lunes".
    const lunesContainer = page.locator('.bg-slate-50.rounded-xl').filter({ hasText: /^Lunes/ });
    
    // El lunes viene con un bloque por defecto (08:00 - 17:00). Lo cambiaremos a 08:00 - 12:00
    const timeInputsBlock1 = lunesContainer.locator('input[type="time"]');
    await timeInputsBlock1.nth(0).fill('08:00'); // ya era 08:00 pero nos aseguramos
    await timeInputsBlock1.nth(1).fill('12:00');

    // Agregamos un SEGUNDO bloque al Lunes usando el botón "Agregar bloque" dentro del contenedor de Lunes
    await lunesContainer.locator('button:has-text("Agregar bloque")').click();

    // Ahora debería haber 4 time inputs (2 del primer bloque y 2 del nuevo)
    const timeInputsAll = lunesContainer.locator('input[type="time"]');
    await expect(timeInputsAll).toHaveCount(4);

    // Llenamos el segundo bloque con un turno de guardia (20:00 - 05:00)
    await timeInputsAll.nth(2).fill('20:00');
    await timeInputsAll.nth(3).fill('05:00');

    // Al poner una salida menor que la entrada, debería aparecer la etiqueta "Nocturno"
    await expect(lunesContainer.locator('span', { hasText: /Nocturno/ })).toBeVisible();

    // Guardamos
    await page.click('button:has-text("Crear")');

    // Esperar a que se cierre el modal y aparezca en la lista
    const newEmployeeRow = page.locator('tr', { hasText: '99991111' });
    await expect(newEmployeeRow).toBeVisible();
    await expect(newEmployeeRow).toContainText('Batman Nocturno');

    // 3. EDICIÓN - Verificar que los datos se guardaron correctamente
    await newEmployeeRow.locator('button[title="Edit"]').click();

    // Validar el modal de nuevo
    const modal = page.locator('.max-w-3xl.rounded-2xl');
    await expect(modal).toBeVisible();

    const lunesContainerEdit = modal.locator('.bg-slate-50.rounded-xl').filter({ hasText: /^Lunes/ });
    
    // Deberían estar los 4 time inputs con los valores exactos
    const editInputs = lunesContainerEdit.locator('input[type="time"]');
    await expect(editInputs).toHaveCount(4);
    await expect(editInputs.nth(0)).toHaveValue('08:00');
    await expect(editInputs.nth(1)).toHaveValue('12:00');
    await expect(editInputs.nth(2)).toHaveValue('20:00');
    await expect(editInputs.nth(3)).toHaveValue('05:00');

    // El badge de nocturno debe persistir para el segundo bloque
    await expect(lunesContainerEdit.locator('span', { hasText: /Nocturno/ })).toBeVisible();

    // Como limpieza de prueba, removemos el segundo bloque
    // El botón de borrar (ícono delete) del segundo bloque
    await lunesContainerEdit.locator('button[title="Eliminar bloque"]').nth(1).click();
    
    // Ahora solo debería quedar 1 bloque (2 inputs)
    await expect(lunesContainerEdit.locator('input[type="time"]')).toHaveCount(2);

    await modal.locator('button:has-text("Guardar")').click();
    await expect(modal).not.toBeVisible();
  });
});
