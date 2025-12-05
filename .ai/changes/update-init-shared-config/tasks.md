## 1. Core Implementation [HIGH]
- [x] 1.1 Add global home directory detection (use $HOME env)
- [x] 1.2 Add function to setup shared ~/.ai/ directory structure
- [x] 1.3 Add embedded templates for 5 Cursor commands (proposal, execute, archive, quick-fix, task-detail)
- [x] 1.4 Modify init to create symlink: .ai/ → ~/.ai/
- [x] 1.5 Modify init to generate .cursor/commands/ from embedded templates

## 2. Options & Flags [MEDIUM]
- [x] 2.1 Add --local flag to create independent .ai/ (original behavior, no symlink)
- [x] 2.2 Add --global-path <path> option to customize shared location

## 3. Safety & Edge Cases [HIGH]
- [x] 3.1 Handle existing .ai/ directory (ask before replacing with symlink)
- [x] 3.2 Handle existing .cursor/commands/ (skip or overwrite with --force)
- [x] 3.3 Handle broken symlinks (recreate)
