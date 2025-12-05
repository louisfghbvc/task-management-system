import * as path from 'path';
import * as fs from 'fs';

/**
 * Find the .ai directory by walking up from cwd
 */
export function findAiDir(): string | null {
  let current = process.cwd();
  
  while (current !== path.dirname(current)) {
    const aiDir = path.join(current, '.ai');
    if (fs.existsSync(aiDir) && fs.statSync(aiDir).isDirectory()) {
      return aiDir;
    }
    current = path.dirname(current);
  }
  
  return null;
}

/**
 * Get paths to key directories
 */
export function getPaths() {
  const aiDir = findAiDir();
  
  if (!aiDir) {
    return null;
  }
  
  return {
    ai: aiDir,
    specs: path.join(aiDir, 'specs'),
    changes: path.join(aiDir, 'changes'),
    memory: path.join(aiDir, 'memory'),
    memoryChanges: path.join(aiDir, 'memory', 'changes'),
    changesLog: path.join(aiDir, 'memory', 'CHANGES_LOG.md'),
    changesView: path.join(aiDir, 'CHANGES.md'),
    project: path.join(aiDir, 'project.md'),
    agents: path.join(aiDir, 'AGENTS.md'),
  };
}

/**
 * Ensure .ai directory exists
 */
export function ensureAiDir(): string {
  const aiDir = findAiDir();
  
  if (aiDir) {
    return aiDir;
  }
  
  // Create in current directory
  const newAiDir = path.join(process.cwd(), '.ai');
  fs.mkdirSync(newAiDir, { recursive: true });
  return newAiDir;
}

