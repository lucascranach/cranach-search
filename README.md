# Cranach Search

## Getting started

1. Create a `.env.local` on the same level as the existing `.env` file
2. In the `.env.local`, assign values for `VITE_AUTH_USER` and `VITE_AUTH_PASS`
3. Start the development mode with `npm run dev`; see section `Commands` for more

## Commands

| Command         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `npm run dev`   | Start the development mode                                   |
| `npm run build` | Build the project; build can then be found in `/dist`        |
| `npm run serve` | Serve the project build; build has to exist; see `npm run build` |


## Environment variables

The Search API URL and access credentials can be controlled with environment variables found in `.env`.
For local development one can also create a `.env.local` not tracked by the VCS, to overwrite environment variables defined and set in `.env`.


**Important:** Only environment variables prefixed with a `VITE_` are accessible in the application and are replaced wih their value at build time.



**Custom environment variables**

| Environment variable       | Description                        | Example                                        |
| -------------------------- | ---------------------------------= | ---------------------------------------------- |
| `VITE_SEARCH_API_URL`      | API endpoint                       | `http://localhost:3000`                        |
| `VITE_CRANACH_COMPARE_URL` | Url called for artefact comparison | `https://lucascranach.org/compare/?artefacts=` |
| `VITE_AUTH_USER`           | Username for basic authentication  | `peter`                                        |
| `VITE_AUTH_PASS`           | Password for basic authentication  | `parker`                                       |


`VITE_AUTH_USER` and `VITE_AUTH_PASS` should be overwritten with a `.env.local`.

For more infos see: [Vite: Env Variables and Modes](https://vitejs.dev/guide/env-and-mode.html)


## Components

Components are grouped and categorized by their characteristics on mutliple levels:



| First level | Second level  | Description                                                  | Example components |
| ----------- | ------------- | ------------------------------------------------------------ | ------------------ |
| `base`      |               | Basic and reusable  components bulding the base for complexer ones |                    |
|             | `interacting` | Used mostly for user interactions                            | `<btn>`            |
|             | `visualizing` | Components with the purpose of outputting and visualizing data; simple | `<image>`          |
| `structure` |               | Components with a stronger and visible structure, to be used for more complex data output (e.g. tabular or hierarchical) or as a composition of components bound or related to at least one or all other components in the composition in some way |                    |
|             | `interacting` | Used primarily for user interactions                         | `<accordion>`      |
|             | `visualizing` | Components with the purpose of outputting and visualizing data; complex | `<artefact-card>`  |
| `pages`     |               | Components to be used as entry points to all aspects of the application; concrete, final and strongly bound to an application | `<search>`         |


## Misc

We are using [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).
