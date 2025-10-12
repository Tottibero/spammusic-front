# Maintenance Tasks

The following maintenance work has been completed and documented for future reference:

## Typo Fix ✅
- **Action:** Renamed the `ComentsModal` component, file, and all related references to `CommentsModal` for clarity and discoverability.
- **Impact:** User-facing strings and developer APIs now use the correct spelling, ensuring consistent naming across the codebase.

## Bug Fix ✅
- **Action:** Pointed the Vite `@assets` alias at `src/assets` so imports resolve to the correct directory.
- **Impact:** Static asset imports are now reliable in both development and build environments.

## Comment/Documentation Alignment ✅
- **Action:** Updated the stale inline comment in the disc card component to describe the votes modal that actually renders there.
- **Impact:** Maintainers reading the template now receive accurate information about the rendered components.

## Test Improvement ✅
- **Action:** Added unit tests that cover the `loadRoles` helper’s JSON parsing, CSV fallback, and malformed data guard.
- **Impact:** Regression detection is improved for one of the most critical authentication edge cases.
