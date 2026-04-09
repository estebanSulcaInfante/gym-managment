import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Ejecutar tests de manera secuencial para no chocar en la DB SQLite */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, /* Un solo trabajador para garantizar aislamiento DB */
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    /* Permisos automáticos para cámara y argumentos de chrome para falso video (pantalla negra) */
    permissions: ['camera'],
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ]
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      /* Start Frontend on alternative port */
      command: 'npx vite --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      cwd: './',
      env: {
         VITE_API_URL: 'http://localhost:5001/api'
      }
    },
    {
      /* Start Backend with Testing DB */
      command: 'venv\\Scripts\\python.exe run.py',
      url: 'http://localhost:5001/api/stats/dashboard', // Wait for this URL to be reachable, it will return 401 but that means server is up
      reuseExistingServer: false,
      cwd: '../backend',
      env: {
        FLASK_ENV: 'testing',
        PORT: '5001',
        DATABASE_URL: 'sqlite:///test_e2e.db'
      }
    }
  ]
});
