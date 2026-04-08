# Budget Personnel — Guide de développement

## Workflow des branches

- Toujours développer dans `test`
- Merger vers `main` uniquement quand c'est validé
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

Avant de merger `test` → `main`, vérifier :

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
