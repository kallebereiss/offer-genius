import type { OfferProject } from "./offer-schema";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds a standalone, production-ready sales page (single HTML file)
 * from a generated offer. No external dependencies, mobile-first.
 */
export function offerToLandingHtml({ brief, offer }: OfferProject): string {
  const { landing } = offer;

  const bullets = offer.bullets.map((b) => `<li>${esc(b)}</li>`).join("");
  const stack = landing.stack.map((s) => `<li>${esc(s)}</li>`).join("");
  const modules = offer.productModules
    .map((m) => `<div class="card"><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p></div>`)
    .join("");
  const bonuses = offer.bonuses
    .map(
      (b) =>
        `<div class="card bonus"><div class="bonus-head"><h3>${esc(b.title)}</h3><span class="tag">${esc(b.perceivedValue)}</span></div><p>${esc(b.description)}</p></div>`,
    )
    .join("");
  const faq = offer.faq
    .map((f) => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`)
    .join("");
  const objections = offer.objections
    .map((o) => `<div class="card"><h3>${esc(o.objection)}</h3><p>${esc(o.answer)}</p></div>`)
    .join("");

  const cta = esc(landing.finalCta || offer.ctas[0] || "Quero agora");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(offer.productName)} — ${esc(offer.slogan)}</title>
<meta name="description" content="${esc(offer.bigPromise).slice(0, 155)}" />
<meta property="og:title" content="${esc(offer.productName)}" />
<meta property="og:description" content="${esc(offer.bigPromise).slice(0, 155)}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<style>
:root{--bg:#ffffff;--fg:#0f1117;--muted:#5b6172;--brand:#5b5bd6;--brand-2:#0ea5e9;--line:#e6e8ef;--soft:#f7f8fc}
*{box-sizing:border-box}
body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--fg);background:var(--bg);line-height:1.6}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
section{padding:56px 0;border-bottom:1px solid var(--line)}
h1{font-size:clamp(30px,5vw,48px);line-height:1.15;margin:0 0 16px;letter-spacing:-.02em}
h2{font-size:clamp(22px,3.4vw,32px);margin:0 0 20px;letter-spacing:-.01em}
h3{font-size:17px;margin:0 0 6px}
p{margin:0 0 14px;color:var(--muted)}
.hero{background:linear-gradient(140deg,#5b5bd6,#0ea5e9);color:#fff;text-align:center;border:0}
.hero p{color:rgba(255,255,255,.9);font-size:18px;max-width:640px;margin:0 auto 28px}
.eyebrow{display:inline-block;background:rgba(255,255,255,.18);border-radius:999px;padding:6px 14px;font-size:13px;margin-bottom:18px}
.btn{display:inline-block;background:#0f1117;color:#fff;text-decoration:none;font-weight:600;padding:16px 32px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
.hero .btn{background:#fff;color:#3b3bb5}
.price{font-size:15px;margin-top:14px;opacity:.9}
ul{padding-left:20px;margin:0 0 14px;color:var(--muted)}
li{margin-bottom:10px}
.grid{display:grid;gap:16px}
@media(min-width:720px){.grid{grid-template-columns:1fr 1fr}}
.card{background:var(--soft);border:1px solid var(--line);border-radius:14px;padding:18px}
.bonus-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
.tag{background:#e8e9ff;color:#3b3bb5;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap}
details{border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:10px}
summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0}
.guarantee{background:var(--soft);border-radius:16px;padding:24px;text-align:center}
.center{text-align:center}
footer{padding:32px 0;text-align:center;color:var(--muted);font-size:13px}
</style>
</head>
<body>
<section class="hero">
  <div class="wrap">
    <span class="eyebrow">${esc(brief.nicho)} · ${esc(brief.formato)}</span>
    <h1>${esc(landing.heroHeadline)}</h1>
    <p>${esc(landing.heroSubheadline)}</p>
    ${landing.heroImage ? `<img src="${landing.heroImage}" alt="${esc(offer.productName)}" style="max-width:100%;border-radius:16px;margin:0 auto 24px;display:block;box-shadow:0 20px 50px rgba(0,0,0,.25)" />` : ""}
    <a class="btn" href="#comprar">${cta}</a>
    <div class="price">${esc(brief.preco)} · ${esc(offer.urgency)}</div>
  </div>
</section>

<section><div class="wrap">
  <h2>Você se identifica com isso?</h2>
  <p>${esc(landing.painSection)}</p>
  <p>${esc(landing.desireSection)}</p>
</div></section>

<section><div class="wrap">
  <h2>O que você recebe</h2>
  <ul>${bullets}</ul>
  <div class="grid">${modules}</div>
</div></section>

<section><div class="wrap">
  <h2>Bônus inclusos</h2>
  <div class="grid">${bonuses}</div>
</div></section>

<section><div class="wrap">
  <h2>Tudo que está incluso</h2>
  <ul>${stack}</ul>
  <p>${esc(landing.transformation)}</p>
</div></section>

<section><div class="wrap">
  <div class="guarantee">
    <h2>${esc(offer.guarantee.title)}</h2>
    <p>${esc(offer.guarantee.description)}</p>
  </div>
</div></section>

<section><div class="wrap">
  <h2>Ainda com dúvida?</h2>
  <div class="grid">${objections}</div>
</div></section>

<section><div class="wrap">
  <h2>Perguntas frequentes</h2>
  ${faq}
</div></section>

<section id="comprar" class="center"><div class="wrap">
  <h2>${esc(offer.headline)}</h2>
  <p>${esc(offer.subheadline)}</p>
  <a class="btn" href="#comprar">${cta}</a>
  <div class="price" style="color:var(--muted)">${esc(brief.preco)} · ${esc(offer.scarcity)}</div>
</div></section>

<footer>© ${new Date().getFullYear()} ${esc(offer.productName)}. Todos os direitos reservados.</footer>
</body>
</html>`;
}
