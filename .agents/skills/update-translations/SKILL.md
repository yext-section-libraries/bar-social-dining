---
name: update-translations
description: Fill the repository's prepared translation gaps and finalize its locale files.
disable-model-invocation: true
---

Run the following steps for the repo in this directory that was specified by the user. Run the commands below in the directory of the specified repo. Do not modify other repos.

# Update translations

1. Run `yextve i18n prepare` and use its complete missing-value report as the work list. If the invoking prompt names locales, limit edits to those locales; otherwise translate every configured platform locale.
2. Fill only missing or empty values in `src/library/i18n/platform`. Preserve every non-empty authored value and each file's nested structure.
3. Preserve interpolation expressions exactly. Interpret contextual key suffixes when choosing wording, and translate each locale-specific plural variant from the matching English plural family. Use British English for `en-GB` and Traditional Chinese for `zh-TW`.
4. Run `yextve i18n finalize`.
5. Review the complete diff. Report any unresolved translation ambiguity or validation failure; finish only when all requested locales pass finalization.

The repository commands are the deterministic source of truth for extraction, coverage, propagation, and linting. Author translations directly without calling an external translation service.

# Update code for untranslated strings

If `yextve i18n finalize` catches untranslated strings, update the React code. Follow these rules:

- use `pt` from `@yext/visual-editor` for editor-facing strings. This includes text in custom fields and react code gated by `props.puck.isEditing`
- use `t` from the `useTranslations` hook from `react-i18next` for live-page facing strings (component rendering) and aria-labels.
- Keep the exact string that

Additionally, review every object of type `YextFields`. All `label` strings should use `msg` from `@yext/visual-editor`.

After making updates, run through the `Update translations` portion of this skill again.

# Other updates

- Replace `i18nComponentsInstance` with `i18nPageInstance`

## Available commands

- `yextve i18n prepare`
- `yextve i18n finalize`
- `yextve validate`
- `npm run typecheck`

Do not run a build.

## Completion criteria

1. All instances of `YextFields` have been reviewed and all `label`s use `msg`
2. `yextve i18n finalize` passes cleanly
3. `npm run typecheck` passes. Note: there may be pre-existing type issues. Those are allowed to remain unresolved. Do not attempt to fix them.
4. `yextve validate` passes cleanly

Note: if you run into an issue that is not directly addressed by these instructions, note the issue and report it to me. Do not attempt to solve unrelated issues or unexpected situations.
