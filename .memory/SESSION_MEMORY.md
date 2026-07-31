# SESSION_MEMORY (sobrescrita por sessão)

**Sessão**: 2026-07-31 · Site público — visibilidade e legibilidade (varredura WCAG AA)

## Contexto vivo
- Branch `claude/website-visibility-readability-2bwhi2`. Dono pediu "tudo completo": varredura
  AA no site público inteiro + piso mínimo de fonte + trava automatizada com axe.
- Interpretação registrada no plano: varredura completa **sim**; migrar os ~2.200 hex inline
  para tokens CSS **não** (alto risco sob UI_REGRESSION_POLICY, zero ganho visual). ADR D-16.

## Causa-raiz (a mesma de #379/#381, 3ª recorrência)
`(website)/layout.tsx:39` pinta a casca de navy `#0B1928`; `UI_DESIGN_STANDARDS` §4 declara
fundo claro `#F7F5F2`; `globals.css :root` assume creme `#F8F6EE`. Três respostas para
"qual é o fundo" — e **nenhum `body { color }`**, então texto sem cor virava preto do browser.
Rede de segurança nova: `body { color: var(--text-primary) }` em `globals.css`.

## Decisões de cor (razões conferidas à mão)
- Navy: `text-white/70` 9,1:1 (corpo) · `/60` 6,9:1 (meta) · `/55` 6,0:1 (placeholder).
- Claro: `#948F84`→`#5A6577` 5,9:1 · `#B8B3A8`→`#6E6C60` 5,3:1 · `#C8A44A`→`#8A6820` 5,1:1.
- **Não existe uma cor que passe em ambos os fundos** (checado: exigiria L ≤ 0,183 e ≥ 0,216).
  Por isso a troca foi decidida por superfície, arquivo a arquivo. `#948F84` e `#C8A44A`
  continuam corretos sobre navy. Bordas (`border-[#B8B3A8]`, `const BORDER`) intocadas.

## Armadilhas descobertas (valem para qualquer sessão futura)
1. **Gate de contraste precisa rolar a página toda antes de auditar.** framer-motion
   `whileInView` deixa tudo abaixo da dobra em `opacity: 0`; o axe ignora invisível. Sem o
   scroll, um rótulo navy-sobre-navy (1,0:1) passava batido. Comprovado nos dois sentidos.
2. **Overlay decorativo com `opacity` no ancestral = falso positivo do axe** (faixa dourada de
   `/pt/credito` lida como 1,1:1 quando o real é ~7:1). Pôr a opacidade na cor: `bg-[#C8A44A]/10`.
3. **`dark:bg-card-dark` não existe no `tailwind.config.ts`** e é usado em 10 arquivos
   (`ui/Textarea`, `ui/Wizard`, 8 do backoffice). Onde há `dark:text-white` junto, dá texto
   branco no branco. Só `ui/Textarea` foi corrigido — **os outros 9 seguem suspeitos**.
4. **A escala `--imi-*` só existe em `:root`, nunca sob `.dark`.** Todo `text-imi-*` é cor de
   tema claro; em painel escuro fica ilegível. Não redefinir sob `.dark` sem revisar o
   backoffice inteiro — foi por isso que `ui/Select.tsx` levou correção local.

## Estado dos gates
tsc 0 · lint limpo · jest 981 passed/5 skipped · contraste axe 7/7.
As **18 falhas do e2e completo são pré-existentes** — conferido com `git stash` na base limpa;
é artefato das credenciais Supabase stub deste container, não da mudança.

## Se retomar
- Pelo mesmo motivo (stub creds), **não foi possível validar visualmente** `SubdivisionLotMap`
  e `AltoBellevuePlanView`; ali as mudanças de `fontSize` estão cobertas por tsc/lint e pelo
  `responsive.spec.ts`, mas não por screenshot renderizado. Conferir contra o preview da Vercel.
- `ui/Card.tsx` (`CardHeader`) tem o formato exato do bug #381, mas o componente **não é usado
  em lugar nenhum** — deixado intacto de propósito; vira risco real se alguém montá-lo.
- Colocar o e2e no CI: sem isso o gate de contraste só protege quem rodar localmente.
