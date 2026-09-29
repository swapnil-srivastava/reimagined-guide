# Claude Code skills

Skills in this folder load automatically in every Claude Code session on this
repository (web, desktop and CLI). Each skill is a folder with a `SKILL.md`.

| Skill | What it does | Source |
|---|---|---|
| `frontend-design` | Guidance for distinctive, intentional UI design: aesthetic direction, typography, restraint, and a plan → build → screenshot-critique loop | [`anthropics/skills@8a1541c`](https://github.com/anthropics/skills/tree/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/frontend-design), Apache-2.0 (see `LICENSE.txt`) |
| `caveman` | Terse "caveman" reply style; only on when asked ("caveman mode", `/caveman`), off with "normal mode" | Copy of `.agents/skills/caveman` ([`JuliusBrussee/caveman`](https://github.com/JuliusBrussee/caveman)) |
| `accessibility-review` | WCAG 2.1 AA audit of a page or design (contrast, keyboard, touch targets, screen readers) | Design plugin ¹ |
| `design-critique` | Structured feedback on usability, hierarchy and consistency | Design plugin ¹ |
| `design-handoff` | Developer handoff specs: layout, tokens, component props, states, breakpoints | Design plugin ¹ |
| `design-system` | Audit, document or extend the design system | Design plugin ¹ |
| `research-synthesis` | Turn research notes, surveys or feedback into themes and recommendations | Design plugin ¹ |
| `user-research` | Plan and run user research: interview guides, usability tests, surveys | Design plugin ¹ |
| `ux-copy` | Write or review microcopy, error messages, empty states and CTAs | Design plugin ¹ |

| `vercel-react-best-practices` | Vercel's React/Next.js performance rules (70 rules in `rules/`) for writing, reviewing or refactoring components, data fetching and bundles | [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) (`skills/react-best-practices`), MIT |
| `web-design-guidelines` | Reviews UI code against Vercel's Web Interface Guidelines, which it fetches fresh on each run | [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) |

¹ Anthropic's Design plugin, [`anthropics/knowledge-work-plugins@da38ec1`](https://github.com/anthropics/knowledge-work-plugins/tree/da38ec1ee89d41e5380e652a97382695003396e7/design), copied verbatim, Apache-2.0 (see `LICENSE-knowledge-work-plugins.txt`). These skills refer to tools as `~~design tool`, `~~project tracker` and so on; `DESIGN-CONNECTORS.md` explains the placeholders. No design-tool connector (Figma etc.) is set up here, so give them a URL, a screenshot or a description instead.

## Updating

`frontend-design` (files are kept verbatim from upstream):

```sh
B=https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design
curl -fsSL $B/SKILL.md -o .claude/skills/frontend-design/SKILL.md
curl -fsSL $B/LICENSE.txt -o .claude/skills/frontend-design/LICENSE.txt
```

Design plugin skills (verbatim from upstream):

```sh
git clone --depth 1 https://github.com/anthropics/knowledge-work-plugins /tmp/kwp
for s in accessibility-review design-critique design-handoff design-system research-synthesis user-research ux-copy; do
  cp /tmp/kwp/design/skills/$s/SKILL.md .claude/skills/$s/SKILL.md
done
cp /tmp/kwp/design/CONNECTORS.md .claude/skills/DESIGN-CONNECTORS.md
```

The two Vercel skills were installed with the `skills` CLI (tracked in `skills-lock.json`):

```sh
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent claude-code --copy -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --agent claude-code --copy -y
npx skills update -p   # refresh project skills later
```

`caveman` is installed by the `skills` CLI into `.agents/skills` (tracked in
`skills-lock.json`), which Claude Code does not read. After updating it there,
copy it here again:

```sh
cp .agents/skills/caveman/SKILL.md .agents/skills/caveman/README.md .claude/skills/caveman/
```
