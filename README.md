# Budget Personnel

Application web de gestion budgétaire personnelle — suivi des revenus, dépenses récurrentes et transactions à venir.

## Stack technique

- **Monofichier** — `index.html` (HTML + CSS + JavaScript vanilla, aucune dépendance de build)
- **Firebase Auth** — authentification Google Sign-In
- **Firestore** — stockage des données par utilisateur (`/users/{uid}/budget/data`)
- **GitHub Pages** — déploiement automatique à chaque push sur `main`

## Fonctionnalités

- Revenus et dépenses récurrentes (hebdo, bimensuel, mensuel, trimestriel, annuel, unique)
- Vue "Prochaines transactions" sur 30 jours avec solde courant estimé
- Quick Transactions (transactions ponctuelles du jour)
- Filtrage par compte bancaire
- Analytique mensuelle (flux net, répartition par catégorie)
- Import / export Excel
- Thème clair / sombre
- Menu contextuel sur les transactions (appui long) — voir [CLAUDE.md](CLAUDE.md) pour les détails

## Développement

Voir [CLAUDE.md](CLAUDE.md) pour les règles de sécurité, le workflow des branches et la checklist avant merge.

```
# Cloner et ouvrir directement dans le navigateur
git clone https://github.com/Sleeplow/budget-app.git
open budget-app/index.html
```

Les variables Firebase sont intégrées dans `index.html`. Toute modification nécessite un compte Firebase avec les règles Firestore décrites dans CLAUDE.md.

## Déploiement

Merger `main` déclenche automatiquement le déploiement GitHub Pages. Ne jamais pousser directement sur `main` — passer par une branche de conversation (`claude/feature-xyz`) et merger une fois validé.
