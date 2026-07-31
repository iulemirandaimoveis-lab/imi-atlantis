# ACCESSIBILITY_REPORT — Relatório de Acessibilidade

> Meta: Lighthouse Accessibility ≥95, WCAG 2.1 AA. Estado 2026-07-02 (análise estática).

---

## Sinais Medidos

| Sinal | Valor | Leitura |
|---|---|---|
| Arquivos com atributos `aria-*` | 72 | adoção real, mas parcial (~6% dos .tsx) |
| `<img>` sem `alt` | 1 ocorrência | quase limpo — corrigir a que falta |
| Arquivos com estilos `focus:`/`focus-visible` | 53 | foco visível existe nos primitivos |
| `prefers-reduced-motion`/`useReducedMotion` | 3 arquivos | **lacuna**: framer-motion em uso amplo sem redução global |
| Locales | pt/en/es/ja/ar | `ar` sem auditoria RTL/leitor de tela |

## Achados

| ID | Achado | Impacto | Prioridade | Recomendação |
|---|---|---|---|---|
| A-01 | ✅ **CORRIGIDO 2026-07-02** — `MotionProvider` (`MotionConfig reducedMotion="user"`) no layout raiz cobre todo framer-motion | — | — | animações CSS/GSAP fora do framer ainda precisam de checagem individual |
| A-02 | Mapas (canvas WebGL) sem alternativa acessível | seleção de lote é 100% visual/pointer | MÉDIA | manter/lista tabular dos lotes como alternativa navegável por teclado (a lista já existe em algumas vistas — padronizar) |
| A-03 | Cobertura aria parcial em composições do backoffice | leitores de tela em tabelas/dashboards | MÉDIA | exigir aria em code review para componentes novos; corrigir ao tocar |
| A-04 | ✅ FECHADO (2026-07-31) — `@axe-core/playwright` ligado em `e2e/a11y.spec.ts` (regra `color-contrast`, 7 rotas públicas). Ressalva: E2E ainda não roda no CI | — | — | estender para outras regras do axe (labels, landmarks) e colocar o job no CI |
| A-05 | ✅ FECHADO (2026-07-31) — varredura WCAG AA no site público (ver D-16). Dourado `#C8A44A` sobre claro dava 2,4:1 → `#8A6820` (5,1:1); `#948F84` como corpo em fundo claro dava 3,2:1 → `#5A6577` (5,9:1); brancos `text-white/20..45` em fundo escuro → escala /55 · /60 · /70 | — | — | rodar `npm run test:e2e -- e2e/a11y.spec.ts` antes de mudar cor de texto |
| A-06 | ✅ N/A — a única ocorrência era mock de teste (`PropertyCard.test.tsx`), não código de produto | — | — | auditoria corrigida 2026-07-02 |

## Regras para Código Novo

1. Todo controle interativo: nome acessível (`aria-label` se sem texto visível).
2. Toda imagem informativa: `alt` descritivo; decorativa: `alt=""`.
3. Modais: focus trap + `aria-modal` + retorno de foco (usar primitivos radix, que já fazem isso).
4. Nunca remover outline de foco sem substituto visível.
5. Animações de entrada: variantes com `useReducedMotion` até A-01 ser aplicado globalmente.

---
**Última atualização**: 2026-07-02
