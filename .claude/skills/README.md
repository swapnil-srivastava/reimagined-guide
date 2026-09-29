# Claude Code skills

Skills in this folder load automatically in every Claude Code session on this
repository (web, desktop and CLI). Each skill is a folder with a `SKILL.md`.

| Skill | What it does | Source |
|---|---|---|
| `frontend-design` | Guidance for distinctive, intentional UI design: aesthetic direction, typography, restraint, and a plan → build → screenshot-critique loop | [`anthropics/skills@8a1541c`](https://github.com/anthropics/skills/tree/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/frontend-design), Apache-2.0 (see `LICENSE.txt`) |
| `caveman` | Terse "caveman" reply style; only on when asked ("caveman mode", `/caveman`), off with "normal mode" | Copy of `.agents/skills/caveman` ([`JuliusBrussee/caveman`](https://github.com/JuliusBrussee/caveman)) |

## Updating

`frontend-design` (files are kept verbatim from upstream):

```sh
B=https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design
curl -fsSL $B/SKILL.md -o .claude/skills/frontend-design/SKILL.md
curl -fsSL $B/LICENSE.txt -o .claude/skills/frontend-design/LICENSE.txt
```

`caveman` is installed by the `skills` CLI into `.agents/skills` (tracked in
`skills-lock.json`), which Claude Code does not read. After updating it there,
copy it here again:

```sh
cp .agents/skills/caveman/SKILL.md .agents/skills/caveman/README.md .claude/skills/caveman/
```
