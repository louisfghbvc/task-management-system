import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export interface ProposalFrontmatter {
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  [key: string]: any;
}

export interface Change {
  id: string;
  path: string;
  hasProposal: boolean;
  hasTasks: boolean;
  hasDesign: boolean;
  hasSpecs: boolean;
  title?: string;
  tasksTotal: number;
  tasksComplete: number;
}

export interface Spec {
  id: string;
  path: string;
  requirements: Requirement[];
}

export interface Requirement {
  name: string;
  scenarios: string[];
}

export interface TaskStats {
  total: number;
  complete: number;
  pending: number;
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  category: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  depends?: string[];
  hasDetailFile?: boolean;
  detailLink?: string;
}

/**
 * Parse a proposal.md file to extract the title
 */
export function parseProposalTitle(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^#\s*Change:\s*(.+)$/m);
  return match ? match[1].trim() : undefined;
}

/**
 * Parse a tasks.md file to get task statistics
 */
export function parseTaskStats(filePath: string): TaskStats {
  if (!fs.existsSync(filePath)) {
    return { total: 0, complete: 0, pending: 0 };
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let total = 0;
  let complete = 0;
  
  for (const line of lines) {
    if (line.match(/^\s*-\s*\[[x ]\]/i)) {
      total++;
      if (line.match(/^\s*-\s*\[x\]/i)) {
        complete++;
      }
    }
  }
  
  return { total, complete, pending: total - complete };
}

/**
 * Parse a spec.md file to extract requirements
 */
export function parseSpec(filePath: string): Requirement[] {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const requirements: Requirement[] = [];
  
  const reqRegex = /###\s*Requirement:\s*(.+)/g;
  const scenarioRegex = /####\s*Scenario:\s*(.+)/g;
  
  let match;
  const reqPositions: { name: string; start: number }[] = [];
  
  while ((match = reqRegex.exec(content)) !== null) {
    reqPositions.push({ name: match[1].trim(), start: match.index });
  }
  
  for (let i = 0; i < reqPositions.length; i++) {
    const req = reqPositions[i];
    const end = i < reqPositions.length - 1 ? reqPositions[i + 1].start : content.length;
    const section = content.substring(req.start, end);
    
    const scenarios: string[] = [];
    let scenarioMatch;
    const localScenarioRegex = /####\s*Scenario:\s*(.+)/g;
    while ((scenarioMatch = localScenarioRegex.exec(section)) !== null) {
      scenarios.push(scenarioMatch[1].trim());
    }
    
    requirements.push({ name: req.name, scenarios });
  }
  
  return requirements;
}

/**
 * List all changes in the changes directory
 */
export function listChanges(changesDir: string): Change[] {
  if (!fs.existsSync(changesDir)) return [];
  
  const changes: Change[] = [];
  const entries = fs.readdirSync(changesDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;
    
    const changePath = path.join(changesDir, entry.name);
    const proposalPath = path.join(changePath, 'proposal.md');
    const tasksPath = path.join(changePath, 'tasks.md');
    const designPath = path.join(changePath, 'design.md');
    const specsDir = path.join(changePath, 'specs');
    
    const taskStats = parseTaskStats(tasksPath);
    
    changes.push({
      id: entry.name,
      path: changePath,
      hasProposal: fs.existsSync(proposalPath),
      hasTasks: fs.existsSync(tasksPath),
      hasDesign: fs.existsSync(designPath),
      hasSpecs: fs.existsSync(specsDir),
      title: parseProposalTitle(proposalPath),
      tasksTotal: taskStats.total,
      tasksComplete: taskStats.complete,
    });
  }
  
  return changes;
}

/**
 * List all specs in the specs directory
 */
export function listSpecs(specsDir: string): Spec[] {
  if (!fs.existsSync(specsDir)) return [];
  
  const specs: Spec[] = [];
  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const specPath = path.join(specsDir, entry.name, 'spec.md');
    if (!fs.existsSync(specPath)) continue;
    
    specs.push({
      id: entry.name,
      path: specPath,
      requirements: parseSpec(specPath),
    });
  }
  
  return specs;
}

/**
 * Get a specific change by ID
 */
export function getChange(changesDir: string, changeId: string): Change | null {
  const changePath = path.join(changesDir, changeId);
  if (!fs.existsSync(changePath)) return null;
  
  const proposalPath = path.join(changePath, 'proposal.md');
  const tasksPath = path.join(changePath, 'tasks.md');
  const designPath = path.join(changePath, 'design.md');
  const specsDir = path.join(changePath, 'specs');
  
  const taskStats = parseTaskStats(tasksPath);
  
  return {
    id: changeId,
    path: changePath,
    hasProposal: fs.existsSync(proposalPath),
    hasTasks: fs.existsSync(tasksPath),
    hasDesign: fs.existsSync(designPath),
    hasSpecs: fs.existsSync(specsDir),
    title: parseProposalTitle(proposalPath),
    tasksTotal: taskStats.total,
    tasksComplete: taskStats.complete,
  };
}

/**
 * Parse tasks.md with enhanced format support (priority, depends, detail links)
 */
export function parseTasksWithDetails(filePath: string): TaskItem[] {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const tasks: TaskItem[] = [];
  
  let currentCategory = '';
  let currentPriority: TaskItem['priority'] | undefined;
  
  for (const line of lines) {
    // Match category header: ## 1. Category Name [HIGH]
    const categoryMatch = line.match(/^##\s*\d+\.\s*(.+?)(?:\s*\[(HIGH|MEDIUM|LOW|CRITICAL)\])?\s*$/i);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      currentPriority = categoryMatch[2]?.toLowerCase() as TaskItem['priority'];
      continue;
    }
    
    // Match task line: - [ ] 1.1 Task title → [📝 details](path)
    const taskMatch = line.match(/^\s*-\s*\[([ x-])\]\s*(\d+\.\d+)\s+(.+?)(?:\s*→\s*\[.*?\]\((.*?)\))?\s*$/i);
    if (taskMatch) {
      const [, statusChar, id, titlePart, detailLink] = taskMatch;
      
      // Parse status
      let status: TaskItem['status'] = 'pending';
      if (statusChar.toLowerCase() === 'x') {
        status = 'done';
      } else if (statusChar === '-') {
        status = 'in_progress';
      }
      
      // Parse title and inline metadata
      let title = titlePart.trim();
      let depends: string[] | undefined;
      let taskPriority = currentPriority;
      
      // Check for depends comment on next lines (not implemented in basic parse)
      
      tasks.push({
        id,
        title,
        status,
        category: currentCategory,
        priority: taskPriority,
        depends,
        hasDetailFile: !!detailLink,
        detailLink,
      });
    }
  }
  
  return tasks;
}

/**
 * Resolve a change identifier (numeric index or change-id string) to a Change object
 * @param changesDir - Path to the changes directory
 * @param identifier - Either a numeric index (1-based) or a change-id string
 * @returns The resolved Change or null if not found
 */
export function resolveChangeId(changesDir: string, identifier: string): Change | null {
  const changes = listChanges(changesDir);
  
  // Check if identifier is a number
  const index = parseInt(identifier, 10);
  if (!isNaN(index) && index > 0 && index <= changes.length) {
    return changes[index - 1];
  }
  
  // Otherwise, treat as change-id string
  return getChange(changesDir, identifier);
}

/**
 * Get the list of changes with their numeric indexes
 * @returns Array of [index, change] tuples (1-based index)
 */
export function getChangesWithIndex(changesDir: string): Array<{ index: number; change: Change }> {
  const changes = listChanges(changesDir);
  return changes.map((change, i) => ({ index: i + 1, change }));
}

/**
 * Prompt user to select a change interactively
 * @param changesDir - Path to the changes directory
 * @returns Promise resolving to selected Change or null if cancelled/no changes
 */
export async function promptChangeSelection(changesDir: string): Promise<Change | null> {
  const changes = listChanges(changesDir);
  
  if (changes.length === 0) {
    return null;
  }
  
  if (changes.length === 1) {
    // Auto-select if only one change
    return changes[0];
  }
  
  // Display options
  console.log('\nSelect a change:');
  changes.forEach((change, i) => {
    const progress = `${change.tasksComplete}/${change.tasksTotal} tasks`;
    console.log(`  ${i + 1}. ${change.id} (${progress})`);
  });
  
  // Prompt for selection
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question('\nEnter number: ', (answer) => {
      rl.close();
      const index = parseInt(answer.trim(), 10);
      if (!isNaN(index) && index > 0 && index <= changes.length) {
        resolve(changes[index - 1]);
      } else {
        console.log('Invalid selection.');
        resolve(null);
      }
    });
  });
}

/**
 * Validate that an index is within the valid range for changes
 */
export function validateChangeIndex(changesDir: string, index: number): { valid: boolean; max: number } {
  const changes = listChanges(changesDir);
  return {
    valid: index > 0 && index <= changes.length,
    max: changes.length,
  };
}

/**
 * Parse YAML frontmatter from a proposal.md file
 * @returns Object with frontmatter data and content, or null if no frontmatter
 */
export function parseProposalFrontmatter(filePath: string): { frontmatter: ProposalFrontmatter; content: string } | null {
  if (!fs.existsSync(filePath)) return null;
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Check for frontmatter (starts with ---)
  if (!fileContent.startsWith('---')) {
    return null;
  }
  
  // Find the closing ---
  const endIndex = fileContent.indexOf('---', 3);
  if (endIndex === -1) {
    return null;
  }
  
  const frontmatterStr = fileContent.substring(3, endIndex).trim();
  const content = fileContent.substring(endIndex + 3).trim();
  
  // Parse simple YAML (key: value format)
  const frontmatter: ProposalFrontmatter = {};
  const lines = frontmatterStr.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Handle null values
      if (value === 'null' || value === '') {
        frontmatter[key] = null;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // Quoted string
        frontmatter[key] = value.slice(1, -1);
      } else {
        frontmatter[key] = value;
      }
    }
  }
  
  return { frontmatter, content };
}

/**
 * Update YAML frontmatter in a proposal.md file
 * @param filePath - Path to proposal.md
 * @param updates - Object with fields to update
 */
export function updateProposalFrontmatter(filePath: string, updates: Partial<ProposalFrontmatter>): boolean {
  if (!fs.existsSync(filePath)) return false;
  
  const parsed = parseProposalFrontmatter(filePath);
  
  if (!parsed) {
    // No frontmatter exists, can't update
    return false;
  }
  
  // Merge updates into existing frontmatter
  const newFrontmatter = { ...parsed.frontmatter, ...updates };
  
  // Build new frontmatter string
  const frontmatterLines: string[] = [];
  for (const [key, value] of Object.entries(newFrontmatter)) {
    if (value === null) {
      frontmatterLines.push(`${key}: null`);
    } else if (typeof value === 'string') {
      frontmatterLines.push(`${key}: "${value}"`);
    } else {
      frontmatterLines.push(`${key}: ${value}`);
    }
  }
  
  const newContent = `---\n${frontmatterLines.join('\n')}\n---\n${parsed.content}`;
  fs.writeFileSync(filePath, newContent);
  
  return true;
}

/**
 * Get current UTC timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

