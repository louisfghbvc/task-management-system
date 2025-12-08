import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getPaths } from '../utils/paths';
import { getChange, parseSpec, resolveChangeId, promptChangeSelection, listChanges, parseTasksWithDetails } from '../utils/parser';

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  file?: string;
}

interface DetailFileFrontmatter {
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
  depends?: string[];
  created_at?: string;
}

/**
 * Extract detail links from tasks.md content
 * Returns array of { taskId, linkPath, taskStatus }
 */
function extractDetailLinks(tasksContent: string): Array<{ taskId: string; linkPath: string; taskStatus: string }> {
  const links: Array<{ taskId: string; linkPath: string; taskStatus: string }> = [];
  const lines = tasksContent.split('\n');
  
  for (const line of lines) {
    // Match: - [x] 1.1 Task title → [📝 details](tasks/1.1-foo.md)
    const match = line.match(/^\s*-\s*\[([ x-])\]\s*(\d+\.\d+)\s+.+?→\s*\[.*?\]\((.+?)\)/i);
    if (match) {
      const [, statusChar, taskId, linkPath] = match;
      let taskStatus = 'pending';
      if (statusChar.toLowerCase() === 'x') {
        taskStatus = 'done';
      } else if (statusChar === '-') {
        taskStatus = 'in_progress';
      }
      links.push({ taskId, linkPath, taskStatus });
    }
  }
  
  return links;
}

/**
 * Parse YAML frontmatter from a detail file
 */
function parseDetailFrontmatter(content: string): DetailFileFrontmatter | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter: DetailFileFrontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'id') frontmatter.id = value;
      if (key === 'title') frontmatter.title = value;
      if (key === 'status') frontmatter.status = value;
      if (key === 'priority') frontmatter.priority = value;
    }
  }
  
  return frontmatter;
}

/**
 * Validate task detail files in the tasks/ directory
 */
function validateTaskDetails(changePath: string, strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];
  const tasksPath = path.join(changePath, 'tasks.md');
  const tasksDir = path.join(changePath, 'tasks');
  
  if (!fs.existsSync(tasksPath)) return errors;
  
  const tasksContent = fs.readFileSync(tasksPath, 'utf-8');
  const detailLinks = extractDetailLinks(tasksContent);
  
  for (const { taskId, linkPath, taskStatus } of detailLinks) {
    const detailPath = path.join(changePath, linkPath);
    
    // Default mode: Check if linked file exists
    if (!fs.existsSync(detailPath)) {
      errors.push({
        type: 'warning',
        message: `Broken detail link: ${linkPath}`,
        file: 'tasks.md',
      });
      continue;
    }
    
    // Strict mode: Validate detail file structure
    if (strict) {
      const content = fs.readFileSync(detailPath, 'utf-8');
      
      // Check frontmatter exists
      const frontmatter = parseDetailFrontmatter(content);
      if (!frontmatter) {
        errors.push({
          type: 'warning',
          message: `Detail file missing YAML frontmatter`,
          file: linkPath,
        });
      }
      
      // Check required sections
      const requiredSections = ['## Description', '## Implementation Details', '## Files to Modify'];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          errors.push({
            type: 'warning',
            message: `Detail file missing section: ${section}`,
            file: linkPath,
          });
        }
      }
      
      // Check status consistency
      if (frontmatter && frontmatter.status) {
        const detailStatus = frontmatter.status.toLowerCase();
        const tasksStatus = taskStatus.toLowerCase();
        
        // Map statuses for comparison
        const normalizeStatus = (s: string) => {
          if (s === 'done' || s === 'completed') return 'done';
          if (s === 'in_progress') return 'in_progress';
          return 'pending';
        };
        
        if (normalizeStatus(detailStatus) !== normalizeStatus(tasksStatus)) {
          errors.push({
            type: 'warning',
            message: `Status mismatch for task ${taskId}: tasks.md=${taskStatus}, detail=${frontmatter.status}`,
            file: linkPath,
          });
        }
      }
    }
  }
  
  return errors;
}

/**
 * Validate section detail files in tasks/ directory (strict mode only)
 * Section files follow pattern: tasks/section-<num>-<name>.md
 */
function validateSectionDetailFiles(changePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const tasksDir = path.join(changePath, 'tasks');
  
  if (!fs.existsSync(tasksDir)) return errors;
  
  const entries = fs.readdirSync(tasksDir);
  const sectionFiles = entries.filter(f => f.startsWith('section-') && f.endsWith('.md'));
  
  for (const fileName of sectionFiles) {
    const filePath = path.join(tasksDir, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = `tasks/${fileName}`;
    
    // Check for required sections
    if (!content.match(/^#\s*Detail:/m)) {
      errors.push({
        type: 'warning',
        message: 'Section detail file missing "# Detail:" title',
        file: relativePath,
      });
    }
    
    if (!content.match(/^##\s*Context/m)) {
      errors.push({
        type: 'warning',
        message: 'Section detail file missing section: ## Context',
        file: relativePath,
      });
    }
    
    if (!content.match(/^##\s*Prerequisites/m)) {
      errors.push({
        type: 'warning',
        message: 'Section detail file missing section: ## Prerequisites',
        file: relativePath,
      });
    }
    
    if (!content.match(/^##\s*Steps/m)) {
      errors.push({
        type: 'warning',
        message: 'Section detail file missing section: ## Steps',
        file: relativePath,
      });
    } else {
      // Check for at least one ### task entry under Steps
      const stepsMatch = content.match(/^##\s*Steps[\s\S]*?(?=^##\s|$)/m);
      if (stepsMatch) {
        const stepsSection = stepsMatch[0];
        if (!stepsSection.match(/^###\s+/m)) {
          errors.push({
            type: 'warning',
            message: 'Section detail file has no task steps defined (missing ### entries)',
            file: relativePath,
          });
        }
      }
    }
  }
  
  return errors;
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
  
  // Validate task detail files (default: broken links, strict: structure + consistency)
  const detailErrors = validateTaskDetails(changePath, strict || false);
  errors.push(...detailErrors);
  
  // Validate dryrun.md (strict mode only)
  if (strict) {
    const sectionDetailErrors = validateSectionDetailFiles(changePath);
    errors.push(...sectionDetailErrors);
  }
  
  return errors;
}

