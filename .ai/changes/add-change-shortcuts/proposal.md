# Change: Add numeric index and interactive selection for change IDs

## Why
輸入完整的 change-id（如 `update-init-shared-config`）很麻煩，無法自動補全。需要更快速的方式選擇 change。

## What Changes
- **ADDED**: 支援數字索引選擇 change（如 `task-magic show 1`）
- **ADDED**: 當沒有指定 change 時，顯示互動式選單讓使用者選擇
- **MODIFIED**: `list` 命令顯示數字索引

## Impact
- Affected specs: task-system
- Affected code: 
  - `cli/src/commands/list.ts`
  - `cli/src/commands/show.ts`
  - `cli/src/commands/validate.ts`
  - `cli/src/commands/archive.ts`
  - `cli/src/utils/parser.ts`
  - `cli/src/commands/init.ts` (Cursor command templates)

## Design

### 數字索引
```bash
task-magic list
# Changes:
#   [1] update-init-shared-config    3/3 tasks
#   [2] add-user-auth                0/5 tasks

task-magic show 1        # 等同 task-magic show update-init-shared-config
task-magic validate 1    # 等同 task-magic validate update-init-shared-config
task-magic archive 1     # 等同 task-magic archive update-init-shared-config
```

### 互動式選擇
```bash
task-magic show
# 沒有指定 change，顯示選單：
# Select a change:
#   1. update-init-shared-config (3/3 tasks)
#   2. add-user-auth (0/5 tasks)
# Enter number: _
```

### 實作方式
1. `list` 命令輸出時加上數字索引 `[1]`, `[2]`...
2. 新增 `resolveChangeId(input)` 工具函數：
   - 如果是數字，查找對應索引的 change
   - 如果是字串，直接當作 change-id
3. 各命令在未指定 change 時，呼叫互動式選擇

### Cursor Commands 更新
更新 init.ts 中的 Cursor command 模板，讓 AI 知道可以用數字索引：

```markdown
# /execute 命令更新
**Steps**
1. Run `task-magic list` to see active changes with indexes
2. Use index (e.g., `task-magic show 1`) or full change-id
...

# /archive 命令更新  
**Steps**
1. Run `task-magic list` to see changes with indexes
2. Archive using index: `task-magic archive 1 --yes`
...
```

