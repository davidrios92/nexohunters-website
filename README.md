# Nexo Hunters — landing page

Static, dependency-free implementation of the **Nexo Hunters Landing** Claude Design file
([project `021b8c7b`](https://claude.ai/design/p/021b8c7b-823a-42b7-a35a-e06b936d56f3?file=Nexo+Hunters+Landing.dc.html)).

Bilingual one-pager for a recruiting-process automation consultancy — Spanish (es-LA) is the
primary version, English (en) is a full translation.

## Live

- Spanish: <https://nexohunters-website.vercel.app/>
- English: <https://nexohunters-website.vercel.app/en/>

Deployed on Vercel (project `nexohunters-website`, team *Emanuel Rios' projects*), linked to
this GitHub repo. **`main` is the production branch — every push to `main` deploys straight
to production.** There is no build step; Vercel just serves the files.

## Run locally

```bash
py -3 -m http.server 8080 --directory "C:/dev/nexo hunters"
```

Spanish at <http://127.0.0.1:8080/>, English at <http://127.0.0.1:8080/en/>.

## Layout

```
index.html                 Spanish page  (served at /)
en/index.html              English page  (served at /en/)
assets/css/styles.css      design tokens + components — shared
assets/js/main.js          mobile nav toggle — shared
assets/img/                logos, mark, favicon
_import/design/            the original Claude Design source, kept for reference
```

Both pages share one stylesheet and one script. All user-facing strings live in the HTML —
the nav toggle's screen-reader labels come from `data-label-open` / `data-label-close` on the
button, so `main.js` never contains copy. **When you edit one page, edit the other.**

## Language routing

A small inline script in each `<head>` runs before paint, so there is no flash of the wrong
language. The order of precedence is:

1. **A stored choice wins.** Clicking ES/EN in the header writes `nx-lang` to `localStorage`;
   from then on that choice is honored on every visit, whatever the browser says.
2. **Otherwise the browser's language decides.** `navigator.languages[0]` starting with `es`
   → Spanish; anything else → English. So a Portuguese or French visitor lands on English.
3. **No JavaScript** → the visitor gets whichever URL they opened, with a working ES/EN link
   in the header. Nothing breaks.

Search engines get `hreflang` es / en / x-default plus a `canonical` on each page, so both
versions are indexed separately rather than looking like duplicates.

> **Note on "depending on where the user accesses from":** this detects the visitor's
> **browser language**, not their country. That is the only signal available to a purely
> static site, and it is usually the better one anyway — an Argentine on an English-language
> laptop probably wants English. If you specifically want *geographic* routing, it needs a
> server or CDN edge: on Vercel a middleware reading `x-vercel-ip-country`, on Cloudflare the
> `CF-IPCountry` header, on Netlify an Edge Function. Say the word and I can add it for
> whichever host you pick.

## How this maps to the design

The design file is a single 98 KB document of inline styles wrapped in Claude Design's
`<x-dc>` element, driven by a canvas runtime (`support.js`) that, among other things,
expands `style-hover="…"` attributes into hover styles. None of that runtime is needed to
ship the page, so the implementation:

- replaces every inline style with tokens and component classes in `styles.css`;
- converts each `style-hover` attribute into a real CSS `:hover` rule;
- rebuilds the repeated card chrome (bleeding hairlines + corner ticks) as two
  pseudo-elements on `.card__frame` instead of four positioned `<div>`s and two inline
  SVGs per card;
- keeps the section structure, copy, color ramp, type scale and spacing values as-is.

Design tokens live in `:root` — the slate ramp `--slate-050 … --slate-700` drives the five
stacked process cards, which darken as they stack.

### Added beyond the design

The design was composed at desktop width only, in Spanish, with no responsive, accessibility
or document-level behavior. This implementation adds:

- breakpoints at 1000 / 860 / 560 px — multi-column grids collapse, the nav becomes a
  toggle-driven panel, and the sticky step stack falls back to static cards (the stacking
  effect needs viewport height that phones do not have);
- the English version and the language routing above;
- a skip link, one `<h1>` per page, labelled landmarks, `aria-expanded` on the nav toggle,
  and `aria-hidden` on the decorative mock-UI panels so their sample data is not announced;
- `prefers-reduced-motion` handling (the hero pulse animation is dropped) and print styles;
- `<title>`, meta description, Open Graph tags, favicon and a correct `lang` attribute.

## Assets

`nexo-logo-card.jpg` and `nexo-logo-white.png` came from the source logos already in this
folder (`Logo 3.png` and `Logo_transparent (3).png` — byte-identical to the design project's
copies).

`nexo-logo-white-trim.png` and `nexo-mark-white.png` were **regenerated locally** by
alpha-trimming and cropping `Logo_transparent (3).png`, because the design project's own
copies could not be downloaded in this environment. They are visually equivalent but not
byte-identical to the originals. If you want the exact files, pull them from the design
project and drop them into `assets/img/` — no code changes needed.

## Still to wire up before launch

| Where | Current value | Needs |
|---|---|---|
| Privacy policy link | `#privacidad` (es) / `#privacy` (en) | a real page — these anchors currently resolve to nothing |
| Production domain | `nexohunters.com` — **decided**, not yet connected | attach it to the Vercel project (see below). The tags already point here, so **nothing in the code needs to change** once DNS is live |

### Contact CTAs

There is deliberately **no calendar booking** — every path leads to email or WhatsApp. The
labels were chosen to match what each button actually does, so none of them promises a
scheduled slot:

| Where | Label (es / en) | Action |
|---|---|---|
| Header nav | Contactanos / Get in touch | scrolls to the contact section |
| Hero, secondary | Hablemos / Let's talk | scrolls to the contact section |
| Contact section, primary | Escribinos por WhatsApp / Message us on WhatsApp | opens WhatsApp |
| Contact section, secondary | Escribinos por mail / Email us | `mailto:` with a prefilled subject |

If a scheduling tool (Cal.com, Calendly…) is added later, the two "scrolls to contact"
buttons are the natural place for it — and *then* "Agendar una reunión" becomes accurate.

### Connecting nexohunters.com

`nexohunters.com` is the intended production domain. It currently resolves (behind Cloudflare)
and serves a *different* site, so until it is pointed here:

- `og:image` 404s → **link previews on WhatsApp/LinkedIn show no image**;
- `canonical` tells Google to index `nexohunters.com` rather than this deployment.

Neither matters much while the site is not being shared. To switch over: add the domain in
Vercel under the project's Settings → Domains, then point the DNS in Cloudflare at Vercel.
Two Cloudflare-specific gotchas: set SSL/TLS mode to **Full (strict)** (Flexible causes a
redirect loop), and if you use the orange-cloud proxy, make sure the record Vercel asks for
is created exactly as given. No code changes are needed — the tags already name this domain.

Contact details in use: **info@nexohunters.com** and WhatsApp **+54 9 11 3209 6054**
(`wa.me/5491132096054`). There is no LinkedIn link — the one in the original design was
removed. The only remaining mention of LinkedIn is the copy line "No hacemos scraping de
LinkedIn" / "We don't scrape LinkedIn", which is a positioning claim, not a link.
