import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getPaths } from '../utils/paths';
import { getChange, listSpecs, parseSpec, parseTaskStats, resolveChangeId, promptChangeSelection, listChanges } from '../utils/parser';

export function showCommand(program: Command) {
  program
    .command('show [item]')
    .description('Display change or spec details (supports numeric index)')
    .option('--type <type>', 'Specify type: change or spec')
    .option('--json', 'Output as JSON')
    .option('--deltas-only', 'Show only spec deltas for a change')
    .action(async (item, options) => {
      const paths = getPaths();
      
      if (!paths) {
        console.error(chalk.red('Error: No .ai directory found. Run `task-magic init` first.'));
        process.exit(1);
      }
      
      // If no item specified, try interactive selection for changes
      if (!item) {
        const changes = listChanges(paths.changes);
        if (changes.length === 0) {
          console.error(chalk.red('No active changes found.'));
          process.exit(1);
        }
        if (changes.length === 1) {
          console.log(chalk.dim(`Auto-selected: ${changes[0].id}`));
          item = changes[0].id;
        } else {
          const selected = await promptChangeSelection(paths.changes);
          if (!selected) {
            process.exit(1);
          }
          item = selected.id;
        }
        options.type = 'change';
      }
      
      // Try to determine type
      let type = options.type;
      if (!type) {
        // First check if it's a numeric index for changes
        const index = parseInt(item, 10);
        if (!isNaN(index)) {
          const change = resolveChangeId(paths.changes, item);
          if (change) {
            showChangeAction(paths.changes, change.id, options);
            return;
          } else {
            const changes = listChanges(paths.changes);
            console.error(chalk.red(`Invalid index: ${index}. Available: 1-${changes.length}`));
            process.exit(1);
          }
        }
        
        // Check if it's a change
        const changePath = path.join(paths.changes, item);
        const specPath = path.join(paths.specs, item);
        
        if (fs.existsSync(changePath)) {
          type = 'change';
        } else if (fs.existsSync(specPath)) {
          type = 'spec';
        } else {
          console.error(chalk.red(`Error: Item '${item}' not found in changes or specs.`));
          process.exit(1);
        }
      }
      
      if (type === 'change') {
        showChangeAction(paths.changes, item, options);
      } else if (type === 'spec') {
        showSpecAction(paths.specs, item, options);
      }
    });
}

function showChangeAction(changesDir: string, changeId: string, options: { json?: boolean; deltasOnly?: boolean }) {
  const change = getChange(changesDir, changeId);
  
  if (!change) {
    console.error(chalk.red(`Error: Change '${changeId}' not found.`));
    process.exit(1);
  }
  
  const proposalPath = path.join(change.path, 'proposal.md');
  const tasksPath = path.join(change.path, 'tasks.md');
  const designPath = path.join(change.path, 'design.md');
  const specsDir = path.join(change.path, 'specs');
  
  if (options.deltasOnly) {
    const deltas = getDeltas(specsDir);
    if (options.json) {
      console.log(JSON.stringify({ changeId, deltas }, null, 2));
    } else {
      console.log(chalk.bold(`Deltas for ${changeId}:`));
      for (const delta of deltas) {
        console.log(`\n${chalk.cyan(delta.capability)}:`);
        console.log(delta.content);
      }
    }
    return;
  }
  
  if (options.json) {
    const result: any = {
      id: change.id,
      title: change.title,
      tasks: parseTaskStats(tasksPath),
      files: {
        proposal: change.hasProposal,
        tasks: change.hasTasks,
        design: change.hasDesign,
        specs: change.hasSpecs,
      },
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  
  // Show proposal content
  if (fs.existsSync(proposalPath)) {
    const content = fs.readFileSync(proposalPath, 'utf-8');
    console.log(content);
  } else {
    console.log(chalk.yellow('No proposal.md found.'));
  }
}

function showSpecAction(specsDir: string, specId: string, options: { json?: boolean }) {
  const specPath = path.join(specsDir, specId, 'spec.md');
  
  if (!fs.existsSync(specPath)) {
    console.error(chalk.red(`Error: Spec '${specId}' not found.`));
    process.exit(1);
  }
  
  if (options.json) {
    const requirements = parseSpec(specPath);
    console.log(JSON.stringify({ id: specId, requirements }, null, 2));
    return;
  }
  
  const content = fs.readFileSync(specPath, 'utf-8');
  console.log(content);
}

function getDeltas(specsDir: string): { capability: string; content: string }[] {
  const deltas: { capability: string; content: string }[] = [];
  
  if (!fs.existsSync(specsDir)) return deltas;
  
  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const specPath = path.join(specsDir, entry.name, 'spec.md');
    if (fs.existsSync(specPath)) {
      deltas.push({
        capability: entry.name,
        content: fs.readFileSync(specPath, 'utf-8'),
      });
    }
  }
  
  return deltas;
}

