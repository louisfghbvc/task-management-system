import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getPaths } from '../utils/paths';
import { getChange, parseTaskStats, resolveChangeId, listChanges } from '../utils/parser';

export function archiveCommand(program: Command) {
  program
    .command('archive <change-id>')
    .description('Archive a completed change (supports numeric index)')
    .option('--yes', 'Skip confirmation prompt')
    .option('-y', 'Skip confirmation prompt')
    .option('--skip-specs', 'Archive without applying spec updates')
    .action((changeId, options) => {
      const paths = getPaths();
      
      if (!paths) {
        console.error(chalk.red('Error: No .ai directory found. Run `task-magic init` first.'));
        process.exit(1);
      }
      
      // Resolve numeric index to change-id
      const change = resolveChangeId(paths.changes, changeId);
      if (!change) {
        const changes = listChanges(paths.changes);
        const index = parseInt(changeId, 10);
        if (!isNaN(index)) {
          console.error(chalk.red(`Invalid index: ${index}. Available: 1-${changes.length}`));
        } else {
          console.error(chalk.red(`Error: Change '${changeId}' not found.`));
        }
        process.exit(1);
      }
      
      archiveChange(paths, change.id, options);
    });
}

function archiveChange(paths: ReturnType<typeof getPaths>, changeId: string, options: { yes?: boolean; y?: boolean; skipSpecs?: boolean }) {
  if (!paths) return;
  
  const change = getChange(paths.changes, changeId);
  
  if (!change) {
    console.error(chalk.red(`Error: Change '${changeId}' not found.`));
    process.exit(1);
  }
  
  const skipConfirm = options.yes || options.y;
  
  // Get task stats
  const tasksPath = path.join(change.path, 'tasks.md');
  const stats = parseTaskStats(tasksPath);
  
  if (!skipConfirm) {
    console.log(chalk.yellow(`Archiving change '${changeId}' with ${stats.complete}/${stats.total} tasks complete.`));
    console.log(chalk.yellow('Use --yes to skip this confirmation.'));
    process.exit(0);
  }
  
  // Create archive directory with date prefix
  const date = new Date().toISOString().split('T')[0];
  const archiveName = `${date}-${changeId}`;
  const archivePath = path.join(paths.memoryChanges, archiveName);
  
  // Ensure memory/changes directory exists
  if (!fs.existsSync(paths.memoryChanges)) {
    fs.mkdirSync(paths.memoryChanges, { recursive: true });
  }
  
  // Move change to archive
  fs.renameSync(change.path, archivePath);
  console.log(chalk.green(`✓ Moved ${changeId} to memory/changes/${archiveName}`));
  
  // Apply spec deltas (unless skipped)
  if (!options.skipSpecs) {
    const specsDir = path.join(archivePath, 'specs');
    if (fs.existsSync(specsDir)) {
      applySpecDeltas(specsDir, paths.specs);
      console.log(chalk.green('✓ Applied spec deltas'));
    }
  }
  
  // Update CHANGES_LOG.md
  updateChangesLog(paths.changesLog, changeId, change.title || '(no title)', stats, archiveName);
  console.log(chalk.green('✓ Updated CHANGES_LOG.md'));
  
  // Update CHANGES.md
  syncChangesView(paths.changes, paths.changesView);
  console.log(chalk.green('✓ Updated CHANGES.md'));
  
  console.log(chalk.bold.green(`\nChange '${changeId}' archived successfully!`));
}

function applySpecDeltas(deltaDir: string, targetSpecsDir: string): void {
  const entries = fs.readdirSync(deltaDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const deltaSpecPath = path.join(deltaDir, entry.name, 'spec.md');
    if (!fs.existsSync(deltaSpecPath)) continue;
    
    const targetDir = path.join(targetSpecsDir, entry.name);
    const targetSpecPath = path.join(targetDir, 'spec.md');
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const deltaContent = fs.readFileSync(deltaSpecPath, 'utf-8');
    
    // For now, simple approach: append ADDED sections to target spec
    // A more sophisticated implementation would merge properly
    if (fs.existsSync(targetSpecPath)) {
      const existingContent = fs.readFileSync(targetSpecPath, 'utf-8');
      
      // Extract ADDED requirements from delta
      const addedMatch = deltaContent.match(/## ADDED Requirements([\s\S]*?)(?=## (MODIFIED|REMOVED|RENAMED) Requirements|$)/);
      
      if (addedMatch) {
        const addedSection = addedMatch[1].trim();
        if (addedSection) {
          // Append to existing spec
          const updatedContent = existingContent + '\n\n' + addedSection;
          fs.writeFileSync(targetSpecPath, updatedContent);
        }
      }
    } else {
      // New spec - extract just the requirements (remove delta headers)
      let cleanContent = deltaContent
        .replace(/## ADDED Requirements\n?/g, '')
        .replace(/## MODIFIED Requirements\n?/g, '')
        .replace(/## REMOVED Requirements\n?/g, '')
        .replace(/## RENAMED Requirements\n?/g, '')
        .trim();
      
      // Add a proper header
      cleanContent = `# ${entry.name} Specification\n\n${cleanContent}`;
      fs.writeFileSync(targetSpecPath, cleanContent);
    }
  }
}

function updateChangesLog(logPath: string, changeId: string, title: string, stats: ReturnType<typeof parseTaskStats>, archiveName: string): void {
  const date = new Date().toISOString().split('T')[0];
  const status = stats.complete === stats.total ? 'Completed' : 'Archived';
  
  const entry = `- **${date} ${changeId}**: ${title} (Status: ${status})
  > Tasks: ${stats.complete}/${stats.total} complete
  > Archived to: memory/changes/${archiveName}
`;
  
  let content = '';
  if (fs.existsSync(logPath)) {
    content = fs.readFileSync(logPath, 'utf-8');
  } else {
    content = '# Changes Log\n\n';
  }
  
  content += '\n' + entry;
  fs.writeFileSync(logPath, content);
}

function syncChangesView(changesDir: string, viewPath: string): void {
  // Import list function
  const { listChanges } = require('../utils/parser');
  const changes = listChanges(changesDir);
  
  let content = '# Active Changes\n\n';
  
  if (changes.length === 0) {
    content += 'No active changes.\n';
  } else {
    for (const change of changes) {
      const icon = change.tasksComplete === change.tasksTotal ? '[x]' : '[ ]';
      const progress = `${change.tasksComplete}/${change.tasksTotal} tasks complete`;
      const title = change.title || '(no title)';
      
      content += `- ${icon} **${change.id}**: ${title}\n`;
      content += `  > ${progress}\n`;
    }
  }
  
  fs.writeFileSync(viewPath, content);
}

