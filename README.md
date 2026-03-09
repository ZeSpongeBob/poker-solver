# Poker Solver Pro (React + TypeScript)

Application multi-pages orientée produit premium :

- **Dashboard**: équité Monte Carlo rapide.
- **Préflop**: plan selon position, stack effectif (bb), joueurs restants, places payées (bulle ICM), pression des joueurs à parler.
- **Postflop**: plan flop/turn/river selon SPR, texture board, position IP/OOP, sizings recommandés.
- **Solver**: éditeur de ranges 13x13 IP/OOP + solveur GTO-like (fréquences d'actions, EV par combo).
- **Tracker**: suivi des mains et résultat net en bb.

> ⚠️ Le solveur est "GTO-like" heuristique (UX et fonctionnalités avancées), pas un moteur CFR/Nash complet.

## Stack
- React + TypeScript + Vite
- Vitest + Testing Library
- Architecture en couches: `domain / application / infrastructure / presentation`

## Lancer
```bash
npm install
npm run dev
```

## Vérifications
```bash
npm run test
npm run build
```
