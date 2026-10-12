# Skills icon migration — Chunk 10 follow-up

## Source readiness and deployment boundary

This source introduces a hybrid picker: exact local React Icons plus the searchable Iconify catalog. No deployment, document write, asset change or activation was performed during implementation.

Keep `resumeSettings.skillsManaged` **false** until the compatible frontend release is deployed and published Skills are complete. The current eight records have legacy paths but no category or order; the owner must supply categories, and may set orders. Existing names and document IDs must not change.

## Published inventory (read-only inspection)

| Published name | Existing document ID | Preferred identifier | Existing path |
| --- | --- | --- | --- |
| CSS3 | `0938fd48-f2d1-4054-b479-b248e0c5bc2f` | `local:css3` | `react-icons/fa/FaCss3` |
| Figma | `c849bc78-7f66-413c-986f-65af3d1a5270` | `local:figma` | `react-icons/fa/FaFigma` |
| Git | `040226b3-9fdb-4e20-8d3e-2d46981ce2b9` | `local:git` | `react-icons/fa/FaGitAlt` |
| HTML5 | `2e5bac9a-cc33-4f7f-9485-3a9ca4a6748d` | `local:html5` | `react-icons/fa/FaHtml5` |
| JavaScript | `e20846a6-6630-4d5f-b6ad-0ea6e821f52b` | `local:javascript` | `react-icons/io5/IoLogoJavascript` |
| Material-UI | `8242c340-42eb-4535-9128-08267de2d3bd` | `local:mui` | `react-icons/si/SiMui` |
| React.js | `98973d41-2aa0-465d-a992-1817e1fffdb5` | `local:react` | `react-icons/fa/FaReact` |
| Redux | `251bfa89-68b3-462d-99fd-e8b3ede28332` | `local:redux` | `react-icons/si/SiRedux` |

## Safe rollout

1. Review both local changes and approve their tests/screenshots.
2. Owner merges the reviewed backend feature branch; keep CMS Skills off.
3. With separate authorization, deploy the new Studio schema/input.
4. In authenticated Studio, verify search, previews, keyboard selection and validation. The local QA harness does not establish hosted authentication or publishing behavior.
5. Open the eight existing documents by their existing IDs. Choose the preferred local identifiers and fill the actual categories. Set display order if desired. Do not create replacement documents.
6. With owner approval, publish those completed records. Do not delete `iconPath`, `iconPackage`, uploaded `icon` fields or assets. The new schema hides those retired fields but preserves them.
7. Verify the compatible frontend locally with read-only CMS data. While the activation switch remains off, an older deployed frontend continues showing its static inventory safely.
8. With separate authorization, deploy the compatible frontend and check its live Skills renderer. Both the picker schema and dynamic renderer must be available before activation.
9. Only then publish `Use CMS Skills = true` and verify the live Resume. Zero published records thereafter intentionally produces an empty section, not resurrected static records.
10. Later, add a future skill with a catalog identifier (for example `simple-icons:typescript`), category and order, and publish it. No frontend import, source edit or routine redeployment is needed for supported Iconify IDs. Account for Sanity CDN caching before diagnosing delayed visibility.

If CMS Skills is already active during a future rollout, release the backward-compatible renderer first, before publishing new icon IDs. Do not leave an active old image-only renderer paired with new icon selections.

## Identifier and compatibility policy

- Canonical field: `iconId`, labeled **Skill Icon**.
- Local values: `local:html5`, `local:css3`, `local:javascript`, `local:react`, `local:figma`, `local:mui`, `local:git`, `local:redux`.
- Remote values: lowercase `collection:name`, using letters/digits and internal hyphens, up to 160 characters. Arbitrary URLs, provider prefixes, module paths and markup are rejected.
- The picker previews remote manual IDs before allowing selection. Publication validation checks syntax without calling Iconify; a valid syntax is not a guarantee of future catalog availability.
- Recognized published legacy paths can pass icon validation without an upload. New documents must select a modern identifier. The legacy exception checks the existing published Sanity document, not a new draft.
- A valid modern selection takes priority even if its remote data is temporarily unavailable. Display a neutral fallback; do not rewrite the selected ID or silently show another icon.
- The hidden legacy image field has no upload requirement and is never used by the Resume renderer.

## Service, caching and privacy

Studio search uses Iconify's public `/search` endpoint with a 350 ms debounce, maximum 32 results, request cancellation, a 10-second deadline and a bounded 50-query/5-minute memory cache. Search sends the query without credentials or a referrer. Iconify's supported loader caches requested icon data and manages remote requests; the entire catalog is not bundled.

Uncached remote SVG icons require Iconify network availability. The SDK's default icon endpoints include `api.iconify.design`, `api.simplesvg.com` and `api.unisvg.com`. Providers receive ordinary network metadata and requested icon IDs; Studio searches additionally reveal search terms. No Sanity tokens or private portfolio form data are sent to these services. Local favorites require no icon-service requests.

Check the applicable icon-set license and brand usage requirements when selecting a new logo. Failures preserve skill names/categories and saved selections. Local previews remain usable during outages.

## Dependencies and checks

Iconify React 6.0.2 supports React >=16, including Studio React 18.3.1 and frontend React 19.0.0. Backend adds react-icons 5.5.0 for exact local previews and declares its existing @sanity/ui 3.5.5 directly. Existing jsdom 26.1.0 is declared as a test dependency for picker interaction tests; no testing framework was added. Frontend adds only @iconify/react 6.0.2 and a Jest-only mapping to the package's supported CommonJS entry.

Use backend Node 22.20+ on 22.x, or 24.12+. Run `npm test`, `npm run typecheck`, `npm run lint`, `sanity schema validate --format json`, and `npm run build`; use existing frontend test/build commands. No real network calls occur in unit tests. All production authoring and hosting actions require separate owner authorization.
