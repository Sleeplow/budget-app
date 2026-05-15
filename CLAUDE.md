# Budget Personnel — Guide de développement

## Workflow des branches

- Développer dans une branche dédiée à la conversation (ex: `claude/feature-xyz`)
- Merger vers `main` depuis la branche de travail une fois validé
- Ne jamais committer directement dans `main`

## Stack technique

- App monofichier (`index.html`) — HTML + CSS + JavaScript vanilla
- Firebase Auth (Google Sign-In) pour l'authentification
- Firestore comme base de données — chemin : `/users/{uid}/budget/data`
- Déploiement automatique sur GitHub Pages à chaque push sur `main`

---

## Règles de sécurité — À respecter pour chaque nouvelle fonctionnalité

### 1. Toujours échapper les données avant de les injecter dans le DOM

Toute variable qui vient de l'utilisateur (description, nom de catégorie, nom de compte, etc.)
doit passer par `escapeHtml()` avant d'être insérée dans `innerHTML`.

```javascript
// ✅ Correct
el.innerHTML = `<span>${escapeHtml(user.desc)}</span>`;

// ❌ Interdit
el.innerHTML = `<span>${user.desc}</span>`;
```

Champs à toujours échapper : `desc`, `cat`, `compte`, `cp`, noms de catégories, noms de comptes.

### 2. Ne jamais mettre de données dynamiques dans un `onclick` inline

Utiliser des attributs `data-*` à la place.

```javascript
// ✅ Correct
`<div data-id="${escapeHtml(item.id)}" onclick="maFonction(this.dataset.id)">`

// ❌ Interdit
`<div onclick="maFonction('${item.id}')">`
```

### 3. Toujours utiliser `crypto.randomUUID()` pour les IDs

```javascript
// ✅ Correct
{ id: crypto.randomUUID(), ... }

// ❌ Interdit
{ id: Date.now() + Math.random(), ... }
```

### 4. Toujours vérifier l'authentification avant d'accéder à Firebase

```javascript
// ✅ Correct
async function maFonction() {
  if (!currentUser) return;
  await window._fbCharger(currentUser.uid);
}
```

### 5. Isoler toutes les données par utilisateur

```javascript
// ✅ Correct — chemin isolé par UID
doc(db, 'users', uid, 'budget', 'data')

// ❌ Interdit — chemin partagé
doc(db, 'budget', 'data')
```

### 6. Valider les couleurs personnalisées avant de les utiliser

```javascript
// ✅ Correct — filtre hex strict
customColors.filter(c => /^#[0-9A-Fa-f]{6}$/.test(c))
```

### 7. Ajouter `escapeHtml()` sur les `<option>` des selects

```javascript
// ✅ Correct
cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
```

---

## Checklist sécurité avant chaque merge vers `main`

Avant de merger vers `main`, vérifier :

- [ ] Toutes les variables utilisateur dans `innerHTML` passent par `escapeHtml()`
- [ ] Aucun `onclick="fn('${variable}')"` avec données dynamiques
- [ ] Les nouveaux IDs utilisent `crypto.randomUUID()`
- [ ] Les nouvelles fonctions Firebase vérifient `if (!currentUser) return`
- [ ] Les nouvelles données Firestore utilisent le chemin `/users/{uid}/...`
- [ ] Les nouveaux scripts CDN externes ont un attribut `integrity="sha384-..."`

---

## Règles Firestore actuelles

```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null
                     && request.auth.uid == userId;
}
```

Si de nouvelles collections sont ajoutées, elles doivent suivre ce même pattern.

---

## Fonctionnalités avec état session (non persisté)

Certaines fonctionnalités modifient l'affichage localement sans sauvegarder dans Firestore. Ces états sont réinitialisés à chaque chargement de la page.

### Menu contextuel — transactions retirées

**Déclenchement :** appui long (~500 ms) sur une ligne de transaction dans l'onglet Transactions, ou clic droit sur desktop.

**Options du menu :**
- **Voir** — équivalent au double-clic : navigue vers la définition de la transaction (onglet Revenus ou Dépenses)
- **Retirer / Ajouter** — bascule l'état "retiré" de l'instance touchée

**Comportement "Retirer" :**
- La ligne reste visible mais est grisée (opacité réduite) et la description est barrée
- La transaction n'est **pas** comptée dans le solde courant, les totaux revenus/dépenses ni le solde estimé final
- Seule **l'instance touchée** est affectée (identifiée par `sourceId + '_' + date`) — les autres occurrences d'une transaction récurrente ne changent pas
- L'état n'est **jamais persisté** — fermer ou recharger l'app réinitialise tout

**Variables d'état :**
```javascript
const _txRetires = new Set();    // clés "sourceId_date" des instances retirées
let _txLongPressTimer = null;    // timer de l'appui long
let _txLongPressFired = false;   // verrou anti-double-tap après appui long
let _txContextTarget = null;     // ligne DOM ciblée par le menu ouvert
```

**Clé d'instance :** `d.id + '_' + o.date` — unique par occurrence, ne cible pas les répétitions.

---

## Fonction escapeHtml — Ne pas modifier

```javascript
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```
