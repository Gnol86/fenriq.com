# Setup New Project from Boilerplate

## Prerequisites

- [Git](https://git-scm.com/) installed
- [Bun](https://bun.sh/) installed
- A PostgreSQL database available
- A new empty Git repository created (e.g. on GitHub)

## Quick Setup (Script)

```bash
./scripts/setup-new-project.sh
```

The script will:

1. Ask for your project name and remote URL
2. Clone the boilerplate
3. Configure `upstream` (boilerplate) and `origin` (your project) remotes
4. Set up the `merge=theirs` strategy for protected files
5. Update `src/site-config.js` with your project name
6. Create an initial commit and push

## Manual Setup

### 1. Clone the boilerplate

```bash
git clone https://github.com/arnaudmarchot/boilerplate.git my-project
cd my-project
```

### 2. Configure remotes

```bash
# Rename origin to upstream (points to boilerplate)
git remote rename origin upstream

# Add your project's remote as origin
git remote add origin git@github.com:your-user/my-project.git
```

### 3. Configure merge strategy

This ensures your project files are never overwritten by boilerplate updates:

```bash
git config merge.theirs.driver true
```

### 4. Customize your project

Edit `src/site-config.js` with your project information:

- `title` - Your project name
- `description` - Your project description
- `prodUrl` - Your production URL
- `appId` - Your app identifier (lowercase, no spaces)
- `mail.from` - Your sender email
- `mail.signature` - Your email signature

### 5. Set up environment

```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

### 6. Install and run

```bash
bun install
bun prisma generate
bun prisma db push
bun dev
```

### 7. Initial commit and push

```bash
git add -A
git commit -m "Initialize my-project from boilerplate"
git push -u origin main
```

## Updating from Boilerplate

To pull the latest boilerplate updates into your project:

```bash
git fetch upstream
git merge upstream/main
```

### What happens during merge

- **Boilerplate files** are updated automatically (components, hooks, lib, actions, etc.)
- **Project files** are protected and kept as-is thanks to `.gitattributes` and `merge=theirs`
- **`package.json`** may need manual merge if both sides added dependencies

### Protected files (never overwritten)

| File/Directory | Purpose |
|---|---|
| `src/project/**` | All your custom code |
| `src/messages/*.project.json` | Project-specific translations |
| `prisma/schema/project.prisma` | Project-specific database models |
| `src/site-config.js` | Project configuration |
| `src/app/page.js` | Landing page |
| `src/app/globals.css` | Theme/styling |
| `public/images/logo.png` | Your logo |
| `public/images/icon.png` | Your icon |
| `AGENTS.md` | Agent instructions |
| `CLAUDE.md` | Agent instructions |

### Resolving conflicts

If conflicts occur (typically in `package.json`):

```bash
# After git merge upstream/main shows conflicts:

# 1. Open the conflicting file
# 2. Keep BOTH sets of dependencies
# 3. Mark as resolved
git add package.json
git commit
```

## Where to Put Your Code

| Type | Location |
|---|---|
| Components | `src/project/components/` |
| Server actions | `src/project/actions/` |
| Hooks | `src/project/hooks/` |
| Utilities | `src/project/lib/` |
| Features | `src/project/features/` |
| Sidebar | `src/project/sidebar/` |
| Translations | `src/messages/*.project.json` |
| Database models | `prisma/schema/project.prisma` |

Use `@project/*` import paths for project-specific code:

```js
import { MyComponent } from "@project/components/my-component";
import { myAction } from "@project/actions/my.action";
```

## FAQ

### Why `merge=theirs` instead of `.gitignore`?

`.gitignore` prevents files from being tracked at all. We want project files to be tracked in the project's own repository, but ignored during upstream merges. `merge=theirs` achieves exactly this: during a merge, Git keeps the local (project) version.

### What if I accidentally modify a boilerplate file?

Your changes will be overwritten on the next `git merge upstream/main`. If you need to customize boilerplate behavior, create a wrapper in `src/project/` instead.

### Can I cherry-pick specific boilerplate updates?

Yes:

```bash
git fetch upstream
git cherry-pick <commit-hash>
```

### How do I see what changed in the boilerplate?

```bash
git fetch upstream
git log upstream/main --oneline
git diff main..upstream/main
```
