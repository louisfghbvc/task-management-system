import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getPaths } from '../utils/paths';
import { listChanges, parseTasksWithDetails, TaskItem } from '../utils/parser';

export function taskCommand(program: Command) {
  const task = program
    .command('task')
    .description('Task-specific commands');

  task
    .command('show <task-id>')
    .description('Show task details')
    .option('--change <change-id>', 'Specify change (auto-detects if only one)')
    .option('--json', 'Output as JSON')
    .action((taskId, options) => {
      showTask(taskId, options);
    });

  task
    .command('detail <task-id>')
    .description('Create or show task detail file')
    .option('--change <change-id>', 'Specify change (auto-detects if only one)')
    .action((taskId, options) => {
      createTaskDetail(taskId, options);
    });

  task
    .command('list')
    .description('List all tasks in a change')
    .option('--change <change-id>', 'Specify change (auto-detects if only one)')
    .option('--json', 'Output as JSON')
    .action((options) => {
      listTasks(options);
    });
}

function findChange(changeId?: string): { id: string; path: string } | null {
  const paths = getPaths();
  if (!paths) {
    console.error(chalk.red('Error: No .ai directory found.'));
    return null;
  }

  const changes = listChanges(paths.changes);

  if (changeId) {
    const change = changes.find(c => c.id === changeId);
    if (!change) {
      console.error(chalk.red(`Error: Change '${changeId}' not found.`));
      return null;
    }
    return { id: change.id, path: change.path };
  }

  if (changes.length === 0) {
    console.error(chalk.red('Error: No active changes found.'));
    return null;
  }

  if (changes.length === 1) {
    return { id: changes[0].id, path: changes[0].path };
  }

  console.error(chalk.red('Error: Multiple changes found. Use --change <id> to specify.'));
  console.log('Available changes:');
  for (const c of changes) {
    console.log(`  ${chalk.cyan(c.id)}`);
  }
  return null;
}

function showTask(taskId: string, options: { change?: string; json?: boolean }) {
  const change = findChange(options.change);
  if (!change) return;

  const tasksPath = path.join(change.path, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    console.error(chalk.red('Error: tasks.md not found.'));
    return;
  }

  const tasks = parseTasksWithDetails(tasksPath);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(chalk.red(`Error: Task '${taskId}' not found.`));
    console.log('Available tasks:');
    for (const t of tasks) {
      console.log(`  ${t.id} - ${t.title}`);
    }
    return;
  }

  // Check for detail file
  const detailPath = path.join(change.path, 'tasks', `${taskId}-${slugify(task.title)}.md`);
  const hasDetail = fs.existsSync(detailPath);

  if (options.json) {
    const result: any = { ...task, hasDetail };
    if (hasDetail) {
      result.detailPath = detailPath;
      result.detailContent = fs.readFileSync(detailPath, 'utf-8');
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Display task
  const statusIcon = task.status === 'done' ? chalk.green('✓') : 
                     task.status === 'in_progress' ? chalk.yellow('→') : 
                     chalk.dim('○');
  
  console.log(`${statusIcon} ${chalk.bold(`Task ${task.id}`)}: ${task.title}`);
  console.log(`   Category: ${task.category} ${task.priority ? `[${task.priority}]` : ''}`);
  console.log(`   Status: ${task.status}`);
  
  if (task.depends && task.depends.length > 0) {
    console.log(`   Depends: ${task.depends.join(', ')}`);
  }

  if (hasDetail) {
    console.log(chalk.dim(`\n   Detail file: tasks/${taskId}-${slugify(task.title)}.md`));
    console.log(chalk.dim('─'.repeat(60)));
    console.log(fs.readFileSync(detailPath, 'utf-8'));
  } else {
    console.log(chalk.dim(`\n   No detail file. Run: task-magic task detail ${taskId}`));
  }
}

function createTaskDetail(taskId: string, options: { change?: string }) {
  const change = findChange(options.change);
  if (!change) return;

  const tasksPath = path.join(change.path, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    console.error(chalk.red('Error: tasks.md not found.'));
    return;
  }

  const tasks = parseTasksWithDetails(tasksPath);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(chalk.red(`Error: Task '${taskId}' not found.`));
    return;
  }

  // Create tasks directory
  const tasksDir = path.join(change.path, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }

  const slug = slugify(task.title);
  const detailPath = path.join(tasksDir, `${taskId}-${slug}.md`);

  if (fs.existsSync(detailPath)) {
    console.log(chalk.yellow(`Detail file already exists: tasks/${taskId}-${slug}.md`));
    console.log(fs.readFileSync(detailPath, 'utf-8'));
    return;
  }

  // Create template (no frontmatter)
  const template = `## Description
${task.title}

## Implementation Details

\`\`\`typescript
// TODO: Add implementation code here
\`\`\`

## Files to Modify
1. \`path/to/file\` - Description of changes

## Test Strategy
- [ ] Verify implementation works as expected
- [ ] Run relevant tests
`;

  fs.writeFileSync(detailPath, template);
  console.log(chalk.green(`✓ Created task detail: tasks/${taskId}-${slug}.md`));

  // Update tasks.md to add link
  let tasksContent = fs.readFileSync(tasksPath, 'utf-8');
  const taskLineRegex = new RegExp(`^(\\s*-\\s*\\[[ x-]\\]\\s*${escapeRegex(taskId)}\\s+.+?)$`, 'm');
  const match = tasksContent.match(taskLineRegex);
  
  if (match && !match[1].includes('→')) {
    const newLine = `${match[1]} → [📝 details](tasks/${taskId}-${slug}.md)`;
    tasksContent = tasksContent.replace(match[1], newLine);
    fs.writeFileSync(tasksPath, tasksContent);
    console.log(chalk.green('✓ Updated tasks.md with link'));
  }
}

function listTasks(options: { change?: string; json?: boolean }) {
  const change = findChange(options.change);
  if (!change) return;

  const tasksPath = path.join(change.path, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    console.error(chalk.red('Error: tasks.md not found.'));
    return;
  }

  const tasks = parseTasksWithDetails(tasksPath);

  if (options.json) {
    console.log(JSON.stringify(tasks, null, 2));
    return;
  }

  console.log(chalk.bold(`Tasks for ${change.id}:\n`));

  let currentCategory = '';
  for (const task of tasks) {
    if (task.category !== currentCategory) {
      currentCategory = task.category;
      console.log(chalk.cyan(`\n## ${currentCategory}`));
    }

    const statusIcon = task.status === 'done' ? chalk.green('[x]') : 
                       task.status === 'in_progress' ? chalk.yellow('[-]') : 
                       '[ ]';
    
    const detailPath = path.join(change.path, 'tasks', `${task.id}-${slugify(task.title)}.md`);
    const hasDetail = fs.existsSync(detailPath) ? chalk.dim(' 📝') : '';
    
    console.log(`  ${statusIcon} ${task.id} ${task.title}${hasDetail}`);
  }

  const done = tasks.filter(t => t.status === 'done').length;
  console.log(chalk.dim(`\n${done}/${tasks.length} tasks complete`));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

