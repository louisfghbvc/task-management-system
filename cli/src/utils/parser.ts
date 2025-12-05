import * as fs from 'fs';
import * as path from 'path';

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

