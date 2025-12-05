## 1. Core Implementation [HIGH]
- [x] 1.1 Add `resolveChangeId()` utility function in parser.ts
- [x] 1.2 Update `list` command to show numeric index [1], [2]...
- [x] 1.3 Add `promptChangeSelection()` utility for interactive selection

## 2. CLI Command Updates [HIGH]
- [x] 2.1 Update `show` command to support numeric index and interactive selection
- [x] 2.2 Update `validate` command to support numeric index and interactive selection
- [x] 2.3 Update `archive` command to support numeric index and interactive selection

## 3. Cursor Command Templates [MEDIUM]
- [x] 3.1 Update /execute template to mention numeric index support
- [x] 3.2 Update /archive template to mention numeric index support
- [x] 3.3 Update /proposal template to show list with indexes

## 4. Testing [MEDIUM]
- [x] 4.1 Test numeric index selection
- [x] 4.2 Test interactive selection when no change specified
- [x] 4.3 Test edge cases (invalid index, no changes)
