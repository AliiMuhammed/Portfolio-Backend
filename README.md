# Sanity Clean Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the community Slack](https://slack.sanity.io/?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

## Local development and validation

Use Node.js 22.20+ (22.x) or 24.12+ (validated with Node.js 24.19.0). The frontend has its
own runtime and dependencies; this requirement applies only to this Studio.

Install the reviewed lockfile with standard peer resolution; no legacy peer flag is needed:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

For the local Studio, run `npm run dev`. A build does not deploy the Studio or
publish documents. Schema extraction can be checked locally with
`npx sanity schema extract --path /tmp/portfolio-schema.json`.

Studio runtime auto-updates are disabled in local source so previews and builds
use the reviewed lockfile versions. The project, dataset and hosted Studio settings
are unchanged; publishing a new Studio still requires separate approval.
