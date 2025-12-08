# Tasks: Add Task Detail and Dryrun File Validation

## 1. Task Detail Validation [HIGH]
- [x] 1.1 Add helper function to extract detail links from tasks.md
- [x] 1.2 Validate detail links point to existing files (default mode)
- [x] 1.3 Parse detail file frontmatter (YAML)
- [x] 1.4 Validate required sections exist (strict mode)
- [x] 1.5 Validate status consistency between tasks.md and detail file (strict mode)

## 2. Dryrun File Validation [MEDIUM]
- [x] 2.1 Check if dryrun.md exists in change directory
- [x] 2.2 Validate `# Dry Run:` title exists (strict mode)
- [x] 2.3 Validate `## Context` section exists (strict mode)
- [x] 2.4 Validate `## Steps` section exists (strict mode)
- [x] 2.5 Validate at least one `###` task entry under Steps (strict mode)

## 3. Integration [MEDIUM]
- [x] 3.1 Integrate task detail validation into `validateChange()` function
- [x] 3.2 Integrate dryrun validation into `validateChange()` function
- [x] 3.3 Add appropriate error/warning types for each validation

## 4. Testing [MEDIUM]
- [x] 4.1 Test broken detail link detection
- [x] 4.2 Test missing section detection in detail files
- [x] 4.3 Test status inconsistency detection
- [x] 4.4 Test dryrun.md validation
- [x] 4.5 Test with existing changes in the repo

