import { execSync } from 'child_process';

try {
  execSync('git checkout src/components/GameScreen.tsx');
  console.log("SUCCESSFULLY RESTORED src/components/GameScreen.tsx");
} catch (error) {
  console.error("Restore failed:", error);
}
