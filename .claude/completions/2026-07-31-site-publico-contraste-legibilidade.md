# Site público — visibilidade e legibilidade (varredura WCAG AA)

**Data**: 2026-07-31 · **Branch**: `claude/website-visibility-readability-2bwhi2` · **PR**: draft

## Problema

Classe de bug **recorrente** (3ª vez): cor de um tema aplicada sobre o fundo do outro.
Corrigida pontualmente em #379 (páginas escuras), #381 (breadcrumb invisível) e no `--t3`
do dark em `globals.css` — voltou toda vez porque nunca se atacou a causa nem se deixou teste.

**Causa estrutural**: `src/app/[lang]/(website)/layout.tsx:39` pinta a casca pública de navy
`#0B1928`, mas `.claude/UI_DESIGN_STANDARDS.md` §4 declara o fundo da página como claro
`#F7F5F2` e `globals.css :root` assume creme `#F8F6EE`. Três respostas para "qual é o fundo".
Somado a isso, **não existia `body { color }`** em lugar nenhum — texto sem cor explícita caía
no preto do browser sobre a casca navy.

## Escala adotada (razões conferidas à mão)

Sobre navy `#0B1928` (mantém `#C8A44A`, 7,5:1):

| Uso | De | Para | Razão |
|---|---|---|---|
| Corpo, links de nav | `text-white/30..45` | `text-white/70` | 9,1:1 |
| Meta / fine print | `text-white/10..30` | `text-white/60` | 6,9:1 |
| Placeholder | `text-white/20` | `text-white/55` | 6,0:1 |
| Placeholder de input escuro | `#3F4E5E` (2,2:1) | `#8FA0B4` | 6,8:1 |

Sobre fundo claro (`#FFF` / `#F7F5F2` / `#F5F0EA` / `#F0EDE5`):

| Uso | De | Para | Razão no branco |
|---|---|---|---|
| Corpo/label mudo | `#948F84` (3,2:1) | `#5A6577` | 5,9:1 |
| Placeholder/nota | `#B8B3A8` (2,1:1) | `#6E6C60` | 5,3:1 |
| Eyebrow/CTA dourado | `#C8A44A` (2,4:1) | `#8A6820` | 5,1:1 |
| Texto em botão dourado | `#FFF` (2,9:1) | `#0B1928` | 8,1:1 |

**Regra que decidiu caso a caso**: `#948F84` e `#C8A44A` continuam **corretos sobre navy**
(5,1:1 e 7,5:1). Só trocados onde a superfície é clara — revisão arquivo a arquivo, nunca `sed`
cego. `#5A6577` já era o `TEXT_SUB` do próprio `ImoveisClient.tsx:52`.

## O que foi corrigido

**Defeitos reais (texto invisível / inutilizável)**
- `globals.css` — `body { color: var(--text-primary) }`. Mata a classe inteira do bug.
- `error.tsx` — `<h2>` sem cor = preto sobre navy (**1,0:1**, título invisível); botão "Início"
  a 2,2:1. `loading.tsx` — arco `border-t-black` invisível.
- `ui/Textarea.tsx` — `dark:bg-card-dark` **não existe** no `tailwind.config.ts` (usado em 10
  arquivos, definido em nenhum): a caixa ficava `bg-white` enquanto `dark:text-white` aplicava
  (layout raiz força `defaultTheme="dark"`) → **texto digitado branco no branco** no formulário
  de avaliação e no de consultoria. Alinhado ao `TextArea` de `ui/Input.tsx`, que já estava certo.
- `ui/Select.tsx` — `text-imi-700` resolvia para `#3E3C34` porque a escala `--imi-*` só existe
  em `:root`, nunca sob `.dark` → **1,6:1** no painel escuro do `AppraisalForm`.
- `ui/Input.tsx` — placeholder e ícones do tema escuro (2,2:1 / ~3:1).
- `contato/page.tsx` — `focus:border-[#C8A44A]/10` deixava a borda **mais fraca** ao focar.
- `CookieConsent.tsx` — branco sobre dourado (2,9:1) → navy (8,1:1).

**Casca global** (toda página): `Header`/`Footer` — nav, contatos, copyright e seletor de idioma
saíram de `/30`–`/50`; tagline de **7px** → 10px (`letterSpacing` 2,2px → 1,6px para não alargar).

**Páginas escuras**: 53 classes `text-white/*` + 55 `color: rgba(255,255,255,...)` inline
elevados em contato, biblioteca, projetos, consultoria, home, avaliações, inteligência, jazz LP,
conteúdo, privacidade, termos, SubdivisionPlanView e afins. Indicadores de scroll deixaram de
usar `opacity-30/40` no wrapper (subiu a cor, não a opacidade do container).

**Superfícies claras**: 36 arquivos — `#948F84`/`#B8B3A8` trocados **só em contexto de texto**
(`color:`, `stroke=`, `text-[…]`, `placeholder-[…]`); `border-[#B8B3A8]` e `const BORDER`
ficaram intactos, são a borda do design. Dourado corrigido em avaliações, projetos,
empreendimentos, conteúdo, privacidade, termos e construtoras — sempre por linha, conferindo
o fundo da seção (o eyebrow do hero navy em `avaliacoes:105` continua `#C8A44A`).

**Tipografia**: prosa de 8–9,5px → 11px (30 pontos) e rótulos uppercase de 8–9px → 10px, o
mínimo do próprio `UI_DESIGN_STANDARDS` §3. Chips/badges de geometria fixa ficaram de fora.

**Armadilhas latentes**: `home/{CTA,FeaturedDevelopments,Services,Method}` fixavam
`background: '#0B1928'` mas coloriam texto com `var(--text-primary/secondary)`, que é
**dependente de tema** — `next-themes` guarda o tema numa única chave de `localStorage`, então
um admin que pusesse o backoffice em claro voltaria à home e veria `#0B1120` sobre `#0B1928`
(1,0:1). Fixados nos literais que o `.dark` já resolvia (aparência de hoje inalterada).
`Stats.tsx` **não** foi tocado: usa `--bg-base` + `--text-secondary` do mesmo tema, é coerente.

## Trava automatizada

`@axe-core/playwright` (devDependency, ADR **D-16**) + regra `color-contrast` em
`e2e/a11y.spec.ts` sobre `/pt`, `/pt/imoveis`, `/pt/imoveis/alto-bellevue`, `/pt/contato`,
`/pt/avaliacoes`, `/pt/credito`, `/pt/sobre`. Fecha A-04 e A-05 do `ACCESSIBILITY_REPORT`.

**Duas descobertas que valem para qualquer teste de contraste neste repo:**

1. **É obrigatório rolar a página inteira antes de auditar.** As seções usam framer-motion
   `whileInView`, então tudo abaixo da dobra fica em `opacity: 0` e o axe (corretamente) ignora
   elemento invisível. Sem o scroll o gate passava em falso — comprovado: um rótulo em navy
   sobre navy (**1,0:1**) não era detectado. Com o scroll, o gate acusa 15 nós ao reintroduzir
   a regressão de `text-white/40` no contato.
2. **Overlay decorativo não pode usar `opacity` no ancestral.** O axe não resolve isso e lê a
   cor cheia: a faixa dourada de `/pt/credito` era acusada a 1,1:1 quando o real é ~7:1.
   Corrigido expressando a opacidade na própria cor (`bg-[#C8A44A]/10`) — visual idêntico.

O scroll revelou uma violação real que estava escondida: tag `bg-emerald-50 text-emerald-600`
em `/pt/avaliacoes` a 3,57:1 → `text-emerald-700`.

## Gates

| Gate | Resultado |
|---|---|
| `tsc --noEmit` | ✅ 0 erros |
| `next lint --quiet` | ✅ limpo |
| `jest` | ✅ 981 passed / 5 skipped / 77 suítes — 0 regressão |
| `a11y.spec.ts` (contraste, 7 rotas) | ✅ 7/7 |
| e2e completo | 73 passed / 18 failed — **as 18 são pré-existentes** |
| Screenshots (1440 + 390) | ✅ `/pt`, `/pt/contato`, `/pt/avaliacoes`, `/pt/credito`, `/pt/sobre` |

**Sobre as 18 falhas de e2e**: verificadas com `git stash` — falham **igualmente na base limpa**.
São artefato das credenciais Supabase stub deste container (as páginas de empreendimento não
carregam dados, então `alto-bellevue.spec.ts` e `smoke.spec.ts` não acham os elementos). Nada a
ver com esta mudança. Pelo mesmo motivo **não foi possível validar visualmente** os componentes
de mapa de lotes (`SubdivisionLotMap`, `AltoBellevuePlanView`) — exigem dados reais; ali as
mudanças de `fontSize` estão cobertas por tsc/lint e pelo `responsive.spec.ts`
(`expectNoHorizontalOverflow`, 8 viewports), mas não por screenshot renderizado.

## Não feito (decisão explícita, ver D-16)

- **Migrar os ~2.200 hex inline para tokens CSS**. Alto risco sob a `UI_REGRESSION_POLICY`,
  zero ganho visual. O `body { color }` já fecha a porta para a recorrência.
- **`ui/Card.tsx` (`CardHeader`)** tem o mesmo formato do bug #381 (`dark:text-[#E8E4DC]` no
  `CardHeader`, `dark:bg-[#0F1E30]` no `Card`, exports diferentes). Verificado: `CardHeader`
  **não é usado em lugar nenhum** — a armadilha não dispara hoje. Deixado intacto para não
  mexer em código morto; anotado aqui como risco futuro.
- **Backoffice e console `/users`** ficaram fora do escopo (só site público).

## Pendências

- Colocar o e2e no CI — sem isso o gate de contraste só protege quem rodar localmente.
- Estender o axe a outras regras (labels, landmarks) — A-02/A-03 seguem abertos.
