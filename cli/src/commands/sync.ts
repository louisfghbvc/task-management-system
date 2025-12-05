import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import { getPaths } from '../utils/paths';
import { listChanges } from '../utils/parser';

export function syncCommand(program: Command) {
  program
    .command('sync')
    .description('Sync CHANGES.md with changes/ folder')
    .action(() => {
      const paths = getPaths();
      
      if (!paths) {
        console.error(chalk.red('Error: No .ai directory found. Run `task-magic init` first.'));
        process.exit(1);
      }
      
      syncChangesView(paths.changes, paths.changesView);
    });
}

function syncChangesView(changesDir: string, viewPath: string): void {
  const changes = listChanges(changesDir);
  
  let content = '# Active Changes\n\n';
  
  if (changes.length === 0) {
    content += 'No active changes.\n';
  } else {
    for (const change of changes) {
      const allComplete = change.tasksComplete === change.tasksTotal && change.tasksTotal > 0;
      const inProgress = change.tasksComplete > 0 && !allComplete;
      
      let icon = '[ ]';
      if (allComplete) icon = '[x]';
      else if (inProgress) icon = '[-]';
      
      const progress = `${change.tasksComplete}/${change.tasksTotal} tasks complete`;
      const title = change.title || '(no title)';
      
      content += `- ${icon} **${change.id}**: ${title}\n`;
      content += `  > ${progress}\n`;
    }
  }
  
  fs.writeFileSync(viewPath, content);
  console.log(chalk.green('✓ CHANGES.md synchronized'));
  console.log(chalk.dim(`  ${changes.length} active change(s)`));
}

