import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getPaths } from '../utils/paths';
import { getChange, parseSpec, resolveChangeId, promptChangeSelection, listChanges } from '../utils/parser';

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  file?: string;
}

export function validateCommand(program: Command) {
  program
    .command('validate [change]')
    .description('Validate a change or all changes (supports numeric index)')
    .option('--strict', 'Enable strict validation')
    .option('--json', 'Output as JSON')
    .action(async (changeId, options) => {
      const paths = getPaths();
      
      if (!paths) {
        console.error(chalk.red('Error: No .ai directory found. Run `task-magic init` first.'));
        process.exit(1);
      }
      
      if (changeId) {
        // Check if it's a numeric index
        const change = resolveChangeId(paths.changes, changeId);
        if (change) {
          validateSingleChange(paths.changes, change.id, options);
        } else {
          const changes = listChanges(paths.changes);
          const index = parseInt(changeId, 10);
          if (!isNaN(index)) {
            console.error(chalk.red(`Invalid index: ${index}. Available: 1-${changes.length}`));
          } else {
            console.error(chalk.red(`Error: Change '${changeId}' not found.`));
          }
          process.exit(1);
        }
      } else {
        validateAllChanges(paths.changes, options);
      }
    });
}

function validateSingleChange(changesDir: string, changeId: string, options: { strict?: boolean; json?: boolean }) {
  const change = getChange(changesDir, changeId);
  
  if (!change) {
    console.error(chalk.red(`Error: Change '${changeId}' not found.`));
    process.exit(1);
  }
  
  const errors = validateChange(change.path, options.strict);
  
  if (options.json) {
    console.log(JSON.stringify({ changeId, valid: errors.length === 0, errors }, null, 2));
    return;
  }
  
  if (errors.length === 0) {
    console.log(chalk.green(`Change '${changeId}' is valid`));
  } else {
    console.log(chalk.red(`Change '${changeId}' has validation errors:`));
    for (const error of errors) {
      const icon = error.type === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
      const file = error.file ? chalk.dim(` (${error.file})`) : '';
      console.log(`  ${icon} ${error.message}${file}`);
    }
    process.exit(1);
  }
}

function validateAllChanges(changesDir: string, options: { strict?: boolean; json?: boolean }) {
  if (!fs.existsSync(changesDir)) {
    console.log(chalk.yellow('No changes directory found.'));
    return;
  }
  
  const entries = fs.readdirSync(changesDir, { withFileTypes: true });
  const results: { changeId: string; valid: boolean; errors: ValidationError[] }[] = [];
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;
    
    const changePath = path.join(changesDir, entry.name);
    const errors = validateChange(changePath, options.strict);
    results.push({ changeId: entry.name, valid: errors.length === 0, errors });
  }
  
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  
  if (results.length === 0) {
    console.log(chalk.yellow('No changes to validate.'));
    return;
  }
  
  let hasErrors = false;
  for (const result of results) {
    if (result.valid) {
      console.log(chalk.green(`✓ ${result.changeId}`));
    } else {
      console.log(chalk.red(`✗ ${result.changeId}`));
      for (const error of result.errors) {
        console.log(`    ${error.message}`);
      }
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    process.exit(1);
  }
}

function validateChange(changePath: string, strict?: boolean): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const proposalPath = path.join(changePath, 'proposal.md');
  const tasksPath = path.join(changePath, 'tasks.md');
  const specsDir = path.join(changePath, 'specs');
  
  // Check required files
  if (!fs.existsSync(proposalPath)) {
    errors.push({ type: 'error', message: 'Missing proposal.md', file: 'proposal.md' });
  }
  
  if (!fs.existsSync(tasksPath)) {
    errors.push({ type: 'error', message: 'Missing tasks.md', file: 'tasks.md' });
  }
  
  // Validate proposal has required sections
  if (fs.existsSync(proposalPath)) {
    const content = fs.readFileSync(proposalPath, 'utf-8');
    
    if (!content.match(/^#\s*Change:/m)) {
      errors.push({ type: 'error', message: 'proposal.md missing "# Change:" header', file: 'proposal.md' });
    }
    
    if (strict) {
      if (!content.match(/^##\s*Why/m)) {
        errors.push({ type: 'warning', message: 'proposal.md missing "## Why" section', file: 'proposal.md' });
      }
      if (!content.match(/^##\s*What Changes/m)) {
        errors.push({ type: 'warning', message: 'proposal.md missing "## What Changes" section', file: 'proposal.md' });
      }
    }
  }
  
  // Validate tasks.md has checkboxes
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    
    if (!content.match(/^\s*-\s*\[[x ]\]/im)) {
      errors.push({ type: 'warning', message: 'tasks.md has no task checkboxes', file: 'tasks.md' });
    }
  }
  
  // Validate spec deltas
  if (fs.existsSync(specsDir)) {
    const specEntries = fs.readdirSync(specsDir, { withFileTypes: true });
    let hasDeltas = false;
    
    for (const entry of specEntries) {
      if (!entry.isDirectory()) continue;
      
      const specPath = path.join(specsDir, entry.name, 'spec.md');
      if (!fs.existsSync(specPath)) continue;
      
      hasDeltas = true;
      const content = fs.readFileSync(specPath, 'utf-8');
      
      // Check for delta sections
      const hasDeltaSection = content.match(/^##\s*(ADDED|MODIFIED|REMOVED|RENAMED)\s*Requirements/m);
      if (!hasDeltaSection) {
        errors.push({
          type: 'error',
          message: `spec.md missing delta section (ADDED/MODIFIED/REMOVED Requirements)`,
          file: `specs/${entry.name}/spec.md`,
        });
      }
      
      // Check requirements have scenarios
      if (strict) {
        const requirements = parseSpec(specPath);
        for (const req of requirements) {
          if (req.scenarios.length === 0) {
            errors.push({
              type: 'error',
              message: `Requirement "${req.name}" has no scenarios`,
              file: `specs/${entry.name}/spec.md`,
            });
          }
        }
      }
    }
    
    // In strict mode, warn if no deltas
    if (strict && !hasDeltas) {
      errors.push({ type: 'warning', message: 'No spec deltas found in specs/', file: 'specs/' });
    }
  }
  
  return errors;
}

