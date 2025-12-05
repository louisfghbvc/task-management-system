#!/usr/bin/env node

import { Command } from 'commander';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { validateCommand } from './commands/validate';
import { archiveCommand } from './commands/archive';
import { initCommand } from './commands/init';
import { syncCommand } from './commands/sync';
import { taskCommand } from './commands/task';

const program = new Command();

program
  .name('task-magic')
  .description('Spec-driven development CLI for AI coding assistants')
  .version('1.0.0');

// Register commands
listCommand(program);
showCommand(program);
validateCommand(program);
archiveCommand(program);
initCommand(program);
syncCommand(program);
taskCommand(program);

program.parse();

