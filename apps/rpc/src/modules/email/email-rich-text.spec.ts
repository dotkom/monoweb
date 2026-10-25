import { describe, expect, it } from "vitest"
import { renderEmailRichText } from "./email-rich-text"

describe("renderEmailRichText", () => {
  it("escapes plain text and preserves line breaks", () => {
    const html = renderEmailRichText("1 < 2 & 3 > 2\r\nNy linje\nSiste linje")

    expect(html).toBe("1 &lt; 2 &amp; 3 &gt; 2<br />Ny linje<br />Siste linje")
  })

  it("preserves editor formatting with inline email styles", () => {
    const html = renderEmailRichText(
      '<h2>Overskrift</h2><p>Et <strong>viktig</strong> og <em>kursivt</em> avsnitt med <u>understreking</u>.</p><ul><li>Første</li><li>Andre</li></ul><blockquote>Sitat</blockquote><pre><code>const value = 1</code></pre><p><a href="https://online.ntnu.no/" title="Online">Les mer</a></p>'
    )

    expect(html).toContain("<h2 style=")
    expect(html).toContain("<strong>viktig</strong>")
    expect(html).toContain("<em>kursivt</em>")
    expect(html).toContain("<u>understreking</u>")
    expect(html).toContain("<ul style=")
    expect(html).toContain("<li style=")
    expect(html).toContain("<blockquote style=")
    expect(html).toContain("white-space: pre-wrap")
    expect(html).toContain('href="https://online.ntnu.no/"')
    expect(html).toContain("text-decoration: underline")
    expect(html).not.toContain("&lt;p")
  })

  it("supports tables and remote images without preserving arbitrary attributes", () => {
    const html = renderEmailRichText(
      '<table><tr><th>Kolonne</th></tr><tr><td colspan="2">Innhold</td></tr></table><img src="https://cdn.online.ntnu.no/image.png" alt="Eksempel" onerror="alert(1)">'
    )

    expect(html).toContain("<table style=")
    expect(html).toContain('colspan="2"')
    expect(html).toContain('src="https://cdn.online.ntnu.no/image.png"')
    expect(html).toContain('alt="Eksempel"')
    expect(html).toContain("max-width: 100%")
    expect(html).not.toContain("onerror")
  })

  it.each([
    "<script>alert(1)</script><p>Trygg tekst</p>",
    '<style>body { display: none; }</style><p style="position:fixed" class="email-bg" id="header" onclick="alert(1)">Trygg tekst</p>',
    '<iframe src="https://example.com"></iframe><form><input name="password"></form><p>Trygg tekst</p>',
    '<svg onload="alert(1)"></svg><math><mi>x</mi></math><p>Trygg tekst</p>',
  ])("removes unsafe markup from %s", (content) => {
    const html = renderEmailRichText(content)

    expect(html).toContain("Trygg tekst")
    expect(html).not.toMatch(/<(script|style|iframe|form|input|svg|math)\b/i)
    expect(html).not.toMatch(/on(click|load|error)=/i)
    expect(html).not.toContain("position:fixed")
    expect(html).not.toContain('class="email-bg"')
    expect(html).not.toContain('id="header"')
  })

  it.each([
    "javascript:alert(1)",
    "java&#x73;cript:alert(1)",
    "data:text/html,test",
    "//example.com",
    "/profil",
  ])("removes unsafe or relative link %s", (address) => {
    const html = renderEmailRichText(`<p><a href="${address}">Lenke</a></p>`)

    expect(html).toContain("Lenke")
    expect(html).not.toContain("href=")
  })

  it.each([
    "data:image/png;base64,aGVsbG8=",
    "javascript:alert(1)",
    "/image.png",
  ])("removes nonremote image %s", (source) => {
    expect(renderEmailRichText(`<img src="${source}">`)).not.toContain("<img")
  })

  it("preserves mailto links and literal template syntax", () => {
    const html = renderEmailRichText('<p>{{ companyName }} <a href="mailto:dotkom@online.ntnu.no">Dotkom</a></p>')

    expect(html).toContain("{{ companyName }}")
    expect(html).toContain('href="mailto:dotkom@online.ntnu.no"')
  })
})
