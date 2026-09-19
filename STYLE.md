# Toolkit style guide

Plain HTML + CSS. Each tool is one self-contained `.html` file with its own `<style>` block. Copy the tokens below into each new tool so they all match.

## Rules

- Keep it simple. Plain HTML and CSS for pages and layout. JavaScript only where a tool needs it to calculate.
- The index page has no JS. Cards are hand-written `<a class="card">` blocks with hand-typed `href`s.
- Every tool page has a "Back to toolkit" link to `index.html` at the top.
- One font family, sentence case everywhere, no all-caps labels, no decorative gradients or heavy shadows.
- Use colour to carry meaning: blue for the main thing (principal, accent), orange for cost or interest, green/red for good/bad result.

## Tokens

```css
:root {
  --bg: #eef1f4;          /* page background */
  --panel: #ffffff;       /* cards and panels */
  --ink: #14202b;         /* main text */
  --ink-soft: #5b6b79;    /* secondary text (car calc calls this --muted) */
  --line: #d5dce3;        /* borders and dividers */
  --accent: #2b4eff;      /* links, focus, key numbers */
  --accent-soft: #e3e9ff; /* pills, thumbnail backgrounds */
  --interest: #ff8a3d;    /* cost / interest highlight */
  --good: #0f8a5f;
  --bad: #d6402b;
  --font: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #10161c; --panel: #18212a; --ink: #e8eef4; --ink-soft: #93a3b1;
    --line: #2a3742; --accent: #7d95ff; --accent-soft: #212c4d;
    --interest: #ff9d5c; --good: #3fd39b; --bad: #ff7a66;
  }
}
```

Font loading, in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" rel="stylesheet">
```

## Type

| Use | Size | Weight |
|---|---|---|
| Page title (h1) | `clamp(30px, 5vw, 46px)`, line-height 1.05, letter-spacing -0.02em | 800 |
| Big result number | `clamp(40px, 7vw, 68px)`, letter-spacing -0.03em | 800 |
| Section heading (h2) | 20-21px | 600 |
| Body | 15-16px, line-height 1.5 | 400 |
| Labels | 15px | 600 |
| Small notes | 13px, `--ink-soft` | 400 |

Use `font-variant-numeric: tabular-nums` on anything with money or figures so digits line up.

## Layout

- Page wrapper: `max-width: 1000-1080px; margin: 0 auto; padding: 24px 20px 64px`.
- Calculator pages: two columns, inputs on the left (about 340px), results on the right. One column below 820px.
- Index page: `display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px`.
- Form sections split 50/50 with `gap: 24px 32px`, one column below 700px.

## Components

**Panel / card**: `background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22-24px`. No shadow.

**Number input**: box with `background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 6-8px 12px`. Text 20px, weight 600. On focus: accent border and `0 0 0 2px var(--accent-soft)` ring. Unit (`£`, `%`, `months`) sits beside it in `--ink-soft`.

**Slider**: `accent-color: var(--accent)`, linked to its number box.

**Mode toggle**: two buttons in a `--bg` tray (radius 10, padding 4). The active one gets a white panel background, a 1px `--line` outline and weight 600.

**Results panel**: big number first, then a three-stat row. Each stat has a 3px top border in its meaning colour (blue, orange, grey) and a small label above the figure.

**Split bar**: 14px tall, radius 7, blue and orange segments showing the proportion, with small labels underneath.

**Receipt (ledger results)**: `background: var(--bg); border-radius: 12px; padding: 16px 18px`. Rows are label left, value right. The total row has a 2px top border. The profit row is 20px, weight 800, green or red.

**Table**: sticky header and footer, right-aligned numbers, first column left-aligned, faint zebra rows, max-height 480px with its own scroll.

**Pills**: `background: var(--accent-soft); color: var(--accent); border-radius: 999px; padding: 2-3px 10px`, 13px, weight 600. Used for section numbers and small tags.

**Tooltip**: 16px round "?" with a 1px border. On hover or focus, shows a dark bubble (`--ink` background, light text, radius 8, 240px wide) above it.

**Collapsible section**: `<details>` with a top border and a 600-weight summary in `--ink-soft`.

**Index card**: image on top (16:10), then title (20px, 600) and one-line description. The border turns accent blue on hover. Thumbnails are simple SVGs in `img/` using the blue and orange tokens on an `--accent-soft` background.

## Accessibility and polish

- Visible focus: `:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }`
- `<meta name="viewport" content="width=device-width, initial-scale=1">` on every page.
- Dark mode via `prefers-color-scheme`, using the tokens above. Do not hard-code colours in components.
- Respect `prefers-reduced-motion` if any motion is added. Currently only a short hover transition is used on cards, if any.

## New tool checklist

1. Copy the tokens and font link from this file.
2. Add the back link, an h1 and a one-sentence description.
3. Build the tool from the components above.
4. Add a thumbnail SVG in `img/`.
5. Add a card to `index.html` with the name, description and `href`.
