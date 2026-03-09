# poker-solver

Prototype d'application web (front-end) pour :

- estimer l'équité d'une main de poker en **préflop / flop / turn / river** (Monte Carlo),
- obtenir des recommandations de **sizings selon stack/pot/position**,
- **tracker les mains** jouées avec statistiques simples (winrate, net bb).

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Format des cartes

- `A K Q J T 9 ... 2` pour les rangs,
- `s h d c` pour les couleurs,
- exemple : `As Kd`, `7h 8h 2c`.

## Notes

- Le calculateur d'équité utilise une simulation Monte Carlo (pas un solveur GTO complet).
- Le tracker est stocké en `localStorage` dans le navigateur.
