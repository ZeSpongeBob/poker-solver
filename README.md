# Poker Solver Tracker (React + TypeScript)

Application visuelle et interactive inspirée de workflows **GTO+** :
- configuration de spot postflop,
- éditeur de ranges en grille 13x13 pour IP/OOP,
- solveur "GTO-like" (heuristique) avec fréquences d'actions et EV par combo,
- calcul d'équité Monte Carlo,
- sizing advisor selon SPR,
- tracker de mains de session.

> ⚠️ Note : ce projet est une base "GTO+ like" côté UX/fonctions, pas un moteur CFR complet de niveau production.

## Stack
- React + TypeScript + Vite
- Vitest + Testing Library
- Architecture en couches (domain / application / infrastructure / presentation)

## Lancer
```bash
npm install
npm run dev
```

## Tests et build
```bash
npm run test
npm run build
```
