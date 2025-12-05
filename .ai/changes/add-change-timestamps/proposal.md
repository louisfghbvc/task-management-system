# Change: Add change-level timestamps to proposal.md

## Why
追蹤 change 的生命週期時間：建立、開始、完成時間，方便統計和回顧。

## What Changes
- **MODIFIED**: `proposal.md` 格式加入 YAML frontmatter
- **MODIFIED**: `/proposal` Cursor command 自動產生時間戳
- **MODIFIED**: `task-magic archive` 自動更新 `completed_at`
- **ADDED**: `task-magic` validate 支援新格式

## Impact
- Affected specs: task-system
- Affected code:
  - `cli/src/commands/init.ts` (Cursor command templates)
  - `cli/src/commands/archive.ts` (update completed_at)
  - `cli/src/commands/validate.ts` (support frontmatter)

## Design

### proposal.md 新格式

```yaml
---
created_at: "2025-12-05T15:30:00Z"
started_at: null
completed_at: null
---
# Change: Add numeric index support

## Why
...
```

### 時間戳說明

| 欄位 | 說明 | 何時設定 |
|------|------|----------|
| `created_at` | 建立時間 | `/proposal` 建立時自動設定 |
| `started_at` | 開始實作時間 | `/execute` 開始時設定（可選） |
| `completed_at` | 完成時間 | `task-magic archive` 時自動設定 |

### 向後相容
- 沒有 frontmatter 的舊 proposal.md 仍然有效
- validator 不強制要求 frontmatter

