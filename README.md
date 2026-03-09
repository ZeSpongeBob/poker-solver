# Poker Solver Tracker (React + TypeScript)

Application visuelle et interactive pour :
- calculer l'équité d'une main (préflop/flop/turn/river) via Monte Carlo,
- obtenir des sizings selon SPR, street et position,
- tracker tes mains avec stats de session.

## Stack
- React + TypeScript + Vite
- Vitest + Testing Library
- Architecture en couches (Clean Architecture légère)

## Lancer le projet
```bash
npm install
npm run dev
```

## Tests (approche TDD)
```bash
npm run test
```

## Structure
- `src/domain`: règles métier (cards, equity, sizing)
- `src/application`: cas d'usage
- `src/infrastructure`: persistance localStorage
- `src/presentation`: UI React + styles + hooks
