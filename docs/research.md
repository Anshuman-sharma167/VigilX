# VigilX Lite frontend research

Verified against official documentation on 9 October 2026.

## Setup and build

- Vite provides a React template. A non-interactive npm scaffold for this directory is `npm create vite@latest . -- --template react`. Current Vite documentation requires Node.js 20.19+ or 22.12+ and notes that templates can require newer versions. ([Vite: Getting Started](https://vite.dev/guide/))
- The standard Vite scripts are `npm run dev` for the development server, `npm run build` for a production build, and `npm run preview` to inspect that build locally. The default production output is `dist`; preview is not a production server. ([Vite: Getting Started](https://vite.dev/guide/), [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy.html))
- Install Lucide's React package with `npm install lucide-react`. Import individual icons as React components; Lucide states that only imported icons are included in the final bundle. ([Lucide React: Getting Started](https://lucide.dev/guide/react/getting-started))
- Plain CSS can be applied through `className`. React recommends CSS classes for static styling instead of inline `style` objects. ([React DOM: Common Components](https://react.dev/reference/react-dom/components/common))

## Markup and accessibility notes

- Use native elements for their intended behavior: buttons for actions, links for navigation, and labeled inputs/selects for search, filters, and review status. W3C recommends an explicit `<label>` whose `for` value matches the control's `id`; in JSX, React uses `htmlFor`. ([W3C WAI: Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/), [React DOM: Common Components](https://react.dev/reference/react-dom/components/common))
- Keep visible keyboard focus indicators. WCAG guidance lists browser-provided focus indicators and CSS `:focus-visible` styling as sufficient techniques, and identifies hidden or removed focus outlines as a failure. ([W3C WAI: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- Do not communicate severity, confidence, or review state by color alone. Pair color with readable text, icons, or another visual cue. ([W3C WAI: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- Present the alert queue as a real data table when rows and columns carry tabular relationships. Use `<th scope="col">` for column headings and a `<caption>` or equivalent accessible name where useful. ([W3C WAI: Tables with One Header](https://www.w3.org/WAI/tutorials/tables/one-header/))
- Lucide icons are `aria-hidden="true"` by default, which is appropriate when an icon only reinforces nearby text. For an icon-only button, put the accessible label on the `<button>` (for example, `aria-label="Open alert details"`), not on the icon. ([Lucide React: Accessibility](https://lucide.dev/guide/react/advanced/accessibility))
- React accepts standard `aria-*` attribute names unchanged. Prefer native HTML semantics first and add ARIA when it supplies a missing accessible name or state. ([React DOM: Common Components](https://react.dev/reference/react-dom/components/common))

These sources support implementation choices only. They do not validate the prototype's synthetic Kubernetes events or its risk-scoring rules.
