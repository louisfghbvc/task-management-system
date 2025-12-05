import { Command } from 'commander';
import chalk from 'chalk';
import { getPaths } from '../utils/paths';
import { listChanges, listSpecs } from '../utils/parser';

export function listCommand(program: Command) {
  program
    .command('list')
    .description('List active changes or specs')
    .option('--specs', 'List specifications instead of changes')
    .option('--json', 'Output as JSON')
    .option('--long', 'Show detailed output')
    .action((options) => {
      const paths = getPaths();
      
      if (!paths) {
        console.error(chalk.red('Error: No .ai directory found. Run `task-magic init` first.'));
        process.exit(1);
      }
      
      if (options.specs) {
        listSpecsAction(paths.specs, options);
      } else {
        listChangesAction(paths.changes, options);
      }
    });
}

function listChangesAction(changesDir: string, options: { json?: boolean; long?: boolean }) {
  const changes = listChanges(changesDir);
  
  if (options.json) {
    // Include index in JSON output
    const changesWithIndex = changes.map((change, i) => ({ index: i + 1, ...change }));
    console.log(JSON.stringify(changesWithIndex, null, 2));
    return;
  }
  
  if (changes.length === 0) {
    console.log(chalk.yellow('No active changes found.'));
    return;
  }
  
  console.log(chalk.bold('Changes:'));
  changes.forEach((change, i) => {
    const index = chalk.dim(`[${i + 1}]`);
    const taskProgress = `${change.tasksComplete}/${change.tasksTotal} tasks`;
    const title = change.title || '(no title)';
    
    if (options.long) {
      console.log(`  ${index} ${chalk.cyan(change.id)}`);
      console.log(`      Title: ${title}`);
      console.log(`      Tasks: ${taskProgress}`);
      console.log(`      Files: ${[
        change.hasProposal ? 'proposal.md' : null,
        change.hasTasks ? 'tasks.md' : null,
        change.hasDesign ? 'design.md' : null,
        change.hasSpecs ? 'specs/' : null,
      ].filter(Boolean).join(', ')}`);
    } else {
      console.log(`  ${index} ${chalk.cyan(change.id.padEnd(30))} ${taskProgress}`);
    }
  });
  
  if (changes.length > 0) {
    console.log(chalk.dim(`\nTip: Use index to select, e.g., task-magic show 1`));
  }
}

function listSpecsAction(specsDir: string, options: { json?: boolean; long?: boolean }) {
  const specs = listSpecs(specsDir);
  
  if (options.json) {
    console.log(JSON.stringify(specs, null, 2));
    return;
  }
  
  if (specs.length === 0) {
    console.log(chalk.yellow('No specs found.'));
    return;
  }
  
  console.log(chalk.bold('Specs:'));
  for (const spec of specs) {
    const reqCount = spec.requirements.length;
    
    if (options.long) {
      console.log(`  ${chalk.green(spec.id)}`);
      console.log(`    Requirements: ${reqCount}`);
      for (const req of spec.requirements) {
        console.log(`      - ${req.name} (${req.scenarios.length} scenarios)`);
      }
    } else {
      console.log(`  ${chalk.green(spec.id.padEnd(30))} ${reqCount} requirements`);
    }
  }
}

