import { test, expect } from '@playwright/test';
import { resetDatabase } from './test-utils';

test.describe('Autenticación y Sesiones', () => {

  test.beforeEach(async () => {
    // Restaurar la BD antes de cada test para garantizar aislamiento total
    resetDatabase();
  });

  test('Debería denegar acceso con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar formulario
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'badpassword');
    
    // Enviar
    await page.click('button[type="submit"]');

    // Verificar que aparece el mensaje de error de Vite/React
    const errorMessage = page.locator('text="Credenciales inválidas"');
    await expect(errorMessage).toBeVisible();
    
    // Verificar que NO hubo redirección (seguimos en login)
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Debería permitir hacer login al Admin y persistir sesión (recargar) y luego desloguear', async ({ page }) => {
    await page.goto('/login');
    
    // Login con credenciales por defecto puestas en reset_db.py
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verificar redirección automática al Dashboard (ruta protegida)
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Verificar que aparece un elemento del dashboard (ej: texto "Admin")
    const usernameDisplay = page.locator('text="Admin Administrador"').first(); // Adjusting based on UI expectations, sometimes "Admin Admin"
    // Let's just check for "Panel General" or similar title header
    const title = page.locator('h2', { hasText: 'Dashboard' });
    await expect(title).toBeVisible();

    // Prueba de persistencia (Reload)
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(title).toBeVisible();

    // Botón de Logout (Usualmente "Cerrar Sesión")
    await page.click('button:has-text("Cerrar Sesión")');

    // Redirección al login
    await expect(page).toHaveURL(/.*\/login/);

    // Intentar volver al dashboard directamente usando la URL
    await page.goto('/dashboard');

    // El frontend debería rebotarnos al login automáticamente por ProtectedRoute
    await expect(page).toHaveURL(/.*\/login/);
  });

});
