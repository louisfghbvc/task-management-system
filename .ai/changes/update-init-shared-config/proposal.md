# Change: Update init to use shared global .ai/ directory with symlinks

## Why
使用者有多個 P4 client（專案目錄），希望：
- 所有專案共享同一套 tasks、specs、changes
- 在任一專案目錄工作時，看到的是同一份資料
- Cursor commands 由 init 自動產生，不需要額外維護

## What Changes
- **MODIFIED**: `task-magic init` 命令行為
  - 在 `~/.ai/` 建立共享目錄結構（如果不存在）
  - 在專案建立 symlink：`.ai/` → `~/.ai/`
  - **直接產生** `.cursor/commands/` 下的 5 個命令檔案（內嵌模板）
- **ADDED**: 新選項 `--local` 保留原本的複製行為（獨立 .ai/）

## Impact
- Affected specs: task-system
- Affected code: `cli/src/commands/init.ts`

## Design Decisions

### 共享目錄結構（在 ~/.ai/）
```
/home/louiliu/.ai/
├── AGENTS.md               # 共享的 AI 指令
├── project.md              # 共享的專案設定
├── CHANGES.md              # 共享的 active changes
├── specs/                  # 共享的 specs
├── changes/                # 共享的 change proposals
└── memory/                 # 共享的 archive
    ├── changes/
    └── CHANGES_LOG.md
```

### 專案目錄結構
```
<any-p4-client>/
├── .ai/ → /home/louiliu/.ai/           # symlink 到共享目錄
└── .cursor/
    └── commands/                        # init 自動產生（非 symlink）
        ├── proposal.md
        ├── execute.md
        ├── archive.md
        ├── quick-fix.md
        └── task-detail.md
```

### 行為邏輯
1. 檢查 `~/.ai/` 是否存在
2. 如果不存在：建立完整目錄結構
3. 如果存在：跳過建立（保留現有資料）
4. 在當前專案建立 `.ai/` symlink → `~/.ai/`
5. **產生** `.cursor/commands/` 目錄和 5 個命令檔案（從內嵌模板）

### Cursor Commands 產生方式
- 命令模板內嵌在 CLI 程式碼中（類似現有的 AGENTS_TEMPLATE）
- init 時直接寫入 `.cursor/commands/`
- 不需要從其他地方複製或 symlink
- 更新 CLI 後，重新執行 `init --force` 可更新命令

### 使用情境
```bash
# 在任意 P4 client 初始化
cd /path/to/p4-client-1
task-magic init
# → 建立 ~/.ai/（如果不存在）
# → 建立 .ai/ symlink
# → 產生 .cursor/commands/*.md

# 在另一個 P4 client 初始化
cd /path/to/p4-client-2  
task-magic init
# → ~/.ai/ 已存在，跳過
# → 建立 .ai/ symlink
# → 產生 .cursor/commands/*.md

# 兩邊的 tasks、changes、specs 都是同一份！
# 但 .cursor/commands/ 是各自獨立產生的
```
