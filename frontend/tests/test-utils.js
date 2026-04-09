import { execSync } from 'child_process';

export function resetDatabase() {
    execSync('"..\\\\backend\\\\venv\\\\Scripts\\\\python.exe" "../backend/manage_e2e_db.py" reset', { stdio: 'inherit' });
}
