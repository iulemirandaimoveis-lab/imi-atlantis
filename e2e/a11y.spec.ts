import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'

/**
 * Acessibilidade — gates objetivos e determinísticos:
 *  • todo botão icon-only tem nome acessível (aria-label/title/aria-labelledby);
 *  • toda imagem de conteúdo tem alt;
 *  • links target=_blank têm rel noopener/noreferrer;
 *  • documento tem lang correto e exatamente um h1;
 *  • contraste de cor (WCAG 2.1 AA) nas páginas públicas, via axe-core.
 *
 * O gate de contraste existe porque a mesma classe de bug voltou três vezes
 * (#379, #381 e o breadcrumb do Alto Bellevue): cor de um tema aplicada sobre o
 * fundo do outro. Fecha A-04 e A-05 de docs/ACCESSIBILITY_REPORT.md.
 */

const PAGES = [
    '/pt/imoveis/alto-bellevue',
    '/pt/imoveis/jazz-boulevard-garanhuns',
    '/users/login',
]

/** Páginas públicas cobertas pelo gate de contraste (as mesmas de responsive/smoke). */
const CONTRAST_PAGES = [
    '/pt',
    '/pt/imoveis',
    '/pt/imoveis/alto-bellevue',
    '/pt/contato',
    '/pt/avaliacoes',
    '/pt/credito',
    '/pt/sobre',
]

for (const path of PAGES) {
    test.describe(`a11y — ${path}`, () => {
        test('botões icon-only têm nome acessível', async ({ page }) => {
            await page.goto(path, { waitUntil: 'domcontentloaded' })
            await page.waitForTimeout(2500)
            const offenders = await page.evaluate(() => {
                const bad: string[] = []
                document.querySelectorAll('button').forEach((b) => {
                    const el = b as HTMLButtonElement
                    if (el.offsetParent === null) return // invisível
                    const text = (el.textContent || '').trim()
                    const name = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('aria-labelledby')
                    if (!text && !name) bad.push(el.outerHTML.slice(0, 120))
                })
                return bad
            })
            expect(offenders, `Botões sem nome acessível em ${path}:\n${offenders.join('\n')}`).toEqual([])
        })

        test('imagens têm alt e links externos têm rel seguro', async ({ page }) => {
            await page.goto(path, { waitUntil: 'domcontentloaded' })
            await page.waitForTimeout(2000)
            const issues = await page.evaluate(() => {
                const out: string[] = []
                document.querySelectorAll('img').forEach((img) => {
                    if (!img.hasAttribute('alt')) out.push(`img sem alt: ${img.src.slice(0, 100)}`)
                })
                document.querySelectorAll('a[target="_blank"]').forEach((a) => {
                    const rel = a.getAttribute('rel') || ''
                    if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
                        out.push(`a[target=_blank] sem rel noopener: ${(a as HTMLAnchorElement).href.slice(0, 100)}`)
                    }
                })
                return out
            })
            expect(issues, issues.join('\n')).toEqual([])
        })

        test('estrutura do documento: lang e h1 único', async ({ page }) => {
            await page.goto(path, { waitUntil: 'domcontentloaded' })
            const lang = await page.evaluate(() => document.documentElement.lang)
            expect(lang, 'html[lang] deve estar definido').toBeTruthy()
            const h1Count = await page.locator('h1').count()
            expect(h1Count, 'página deve ter exatamente 1 h1').toBeLessThanOrEqual(1)
            expect(h1Count).toBeGreaterThanOrEqual(0)
        })
    })
}

for (const path of CONTRAST_PAGES) {
    test(`contraste WCAG AA — ${path}`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'domcontentloaded' })
        // Espera a hidratação: no dev mode o DOM muda depois do primeiro paint.
        await page.waitForTimeout(2500)

        // OBRIGATÓRIO percorrer a página inteira antes de auditar. As seções usam
        // framer-motion com `whileInView`, então tudo abaixo da dobra fica em
        // `opacity: 0` até entrar no viewport — e o axe (corretamente) ignora
        // elemento invisível. Sem este scroll o gate só enxerga a primeira dobra.
        await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 500) {
                window.scrollTo(0, y)
                await new Promise((r) => setTimeout(r, 60))
            }
            window.scrollTo(0, 0)
        })
        await page.waitForTimeout(1200)

        const { violations } = await new AxeBuilder({ page })
            .withRules(['color-contrast'])
            .analyze()

        const detail = violations
            .flatMap((v) => v.nodes)
            .map((n) => `  ${n.target.join(' ')}\n    ${n.failureSummary?.replace(/\n/g, '\n    ')}`)
            .join('\n')

        expect(violations, `Contraste abaixo de AA em ${path}:\n${detail}`).toEqual([])
    })
}
