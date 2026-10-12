# Chunk 10 — local source readiness and content activation

No dataset mutations, uploads, schema deployments, commits or pushes were performed.
Studio and React both target project `yv2hgb0y`, dataset `production`.

## Published inventory observed on 2026-10-12

- 7 Work documents; existing order is unchanged (the frontend query has no explicit sort).
- Every Work record has title, description, techStack and imageurl; 5 have demo URLs,
  6 have GitHub URLs, 6 have video URLs. Legacy descriptions range from 81 to 216 characters.
- No Work record currently has showOnHomePage, shortDescription or longDescription.
  Missing flags deliberately produce an empty Home selection; Work still lists all 7.
- 8 existing Skill documents were found despite no skill schema in this source baseline.
  Their names are Git, CSS3, Redux, HTML5, Material-UI, React.js, Figma and JavaScript.
  They lack the new category, icon and order fields. Inspect/update those existing IDs;
  do not create duplicate documents or silently change names.
- 4 Experience and 11 Courses documents exist. They are untouched.
- No published document with ID `resumeSettings` exists. The local PDF remains the fallback.
- Additional older dataset types (including testimonials) are untouched; this task does not
  add or remove unrelated schema types or documents.

## Additive schemas

Work keeps every existing field. showOnHomePage defaults to false only for new documents.
Short Description is optional multiline text, max 300 characters; Long Description is
optional multiline text. Cards prefer shortDescription; details prefer longDescription;
both fall back to the original description. Search includes all three fields.

Skills provide name, category, uploaded PNG/WebP icon and optional nonnegative integer order.
Name/category/icon are required for publication. CRUD uses authenticated Studio only.
Public React reads do not require or contain mutation tokens. Uploaded images are rendered
as image elements, never injected SVG markup. Icons use 64px CDN transformations for the
30px display, lazy loading and a decorative fallback for missing/broken images.
Absent/malformed orders sort after numbered records; ties use name and document ID.

The Résumé Settings singleton uses the exact document ID `resumeSettings`. Structure Tool
opens that document directly; global creation and duplicate/delete actions are excluded.
Existing Work, Experience and Courses remain available. The singleton holds optional cvFile
and skillsManaged (default false). PDF acceptance plus referenced-asset MIME/extension
validation rejects non-PDF assets. This validation performs a read, not a mutation.

## Approval-dependent migration sequence

1. Independently review both local branches and the schema changes/tests.
2. Obtain separate authorization to deploy Studio. A local build does not update the hosted Studio.
3. In the authorized Studio, inspect/update the eight existing Skill records. Use the approved
   inventory below as a content checklist; reconcile React.js/Material-UI names with the owner.
   Upload real PNG/WebP technology icons, assign categories and optional order, then publish.
4. Verify published Skill names, categories, icons, order and absence of duplicate IDs using
   public reads. Do not enable CMS management until this is complete.
5. Open Résumé Settings, enable Use CMS Skills and publish. React now uses only CMS Skills.
   Zero published skills after activation means an empty section. It never revives the static
   list. Before activation the approved static list remains available. An unreadable CMS
   response shows an error, rather than guessing the activation state or restoring old data.
6. Enable Show on Home Page only for projects selected by the owner. Publish each change.
   All selected projects appear, with no two-project limit. No flags are automatically assigned.
7. Enter factual short/long descriptions as desired; do not erase the legacy description.
   Legacy fallback continues until the owner approves each replacement.
8. Upload the actual approved PDF into the singleton and publish. React reads the referenced
   public asset URL and metadata; only an HTTPS PDF asset under this project's production
   file CDN is accepted. Download uses `?dl=Ali-Muhammed-Resume.pdf`, with the native download
   attribute preserved. Missing/malformed/unavailable CMS data retains the bundled PDF.
9. After separate frontend release approval, verify real content, mobile layouts, authoring
   CRUD, actual PDF downloading and republishing end to end. These live workflows have not
   been executed here. Reads occur when components mount; publishing may require a reload
   and public CDN caches may delay visibility. No instant-update guarantee or automatic polling.
10. Remove legacy skill/PDF/description fallbacks only in a separately reviewed follow-up.

### Approved React skill inventory (no proficiency claims)

| Name | Category | Suggested order |
|---|---|---|
| HTML5 | Frontend | 0 |
| CSS3 | Frontend | 1 |
| JavaScript | Frontend | 2 |
| React | Frontend | 3 |
| Figma | Design & UI | 4 |
| Material UI | Design & UI | 5 |
| Git | Tools & state | 6 |
| Redux | Tools & state | 7 |

## Local checks and dependency notes

Default npm ci fails on existing peer-dependency lockfile resolution (react-is/ajv).
`npm ci --legacy-peer-deps` succeeds without modifying either package file. The installed
locked tree reports 80 vulnerabilities (4 low, 35 moderate, 38 high, 3 critical); remediation
was not attempted because dependency upgrades are outside this chunk.

The existing auto-update setting reports locked Studio 3.71.2 versus hosted runtime 4.22.0.
`npm run build -- --no-auto-updates` validates the locked local code without changing
configuration or hosted versions. Hosted compatibility still needs separately approved QA.
There are no existing lint/type-check package scripts; run local binaries directly:

- `./node_modules/.bin/tsc --noEmit --incremental false`
- `./node_modules/.bin/eslint sanity.config.ts schemaTypes`
- `./node_modules/.bin/sanity schema extract --path /tmp/chunk10-schema.json`
- `node --test tests/chunk10-schema.test.cjs`

The schema tests stub dataset reads. Browser mock-data QA intercepts public GET responses
only; mock featured flags/icons/PDF metadata are never stored in Sanity. No authoring CRUD,
real PDF replacement, Studio deployment or production publishing is implied by these checks.
