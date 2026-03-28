# Versioning System

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

## Quick Commands

```bash
# Bug fix: 1.0.0 → 1.0.1
npm run version:patch

# New feature: 1.0.0 → 1.1.0
npm run version:minor

# Breaking change: 1.0.0 → 2.0.0
npm run version:major
```

## Workflow

1. Make your changes and commit them
2. Run version command (creates tag and updates all package.json files)
3. Update CHANGELOG.md with your changes
4. Commit the changelog
5. Push with tags: `git push origin main --tags`

## Where Version Shows

- User profile page (bottom)
- API endpoint: `GET /api/version`
- All package.json files

## Rollback

```bash
# See all versions
git tag

# Rollback to specific version
git checkout v1.0.0
```
