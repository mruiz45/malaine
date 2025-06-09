# Prompt pour Implémentation de User Story

## 🎯 OBJECTIF
Implémenter la User Story **[US_003_section_specifique_bebes]** pour le projet "malaine" en respectant STRICTEMENT toutes les règles et standards définis.

## 📋 INSTRUCTIONS IMPÉRATIVES

### 1. PRÉPARATION (OBLIGATOIRE)
Avant toute action, tu dois:
1. **LIRE** intégralement la User Story fournie
2. **LIRE** et **MÉMORISER** les règles dans `./.cursor/rules/malaine-rules.mdc`
3. **LIRE** et **ANALYSER** le document `./docs/architecture.md` pour:
   - Identifier les composants réutilisables existants
   - Comprendre les patterns et conventions du projet
   - Vérifier les services et helpers disponibles
   - Éviter de dupliquer des fonctionnalités existantes
4. **IDENTIFIER** tous les fichiers existants qui pourraient être réutilisés
5. **VÉRIFIER** les dépendances mentionnées dans la US

### 2. CONTRAINTES ABSOLUES 🚫
- **NE JAMAIS** modifier du code qui fonctionne et qui n'est pas mentionné dans la US
- **NE JAMAIS** refactoriser du code existant sauf si explicitement demandé
- **NE JAMAIS** créer de nouveaux composants si des similaires existent déjà
- **NE JAMAIS** lancer `npm run build` 
- **NE JAMAIS** modifier les fichiers de configuration
- **NE JAMAIS** ajouter de dépendances npm sans autorisation explicite
- **NE JAMAIS** implémenter de fonctionnalités non décrites dans la US

### 3. PROCESSUS D'IMPLÉMENTATION 

#### Étape 1: PLAN D'IMPLÉMENTATION 📝
Fournis d'abord un plan détaillé incluant:

```markdown
## Plan d'Implémentation

### 1. Analyse des Besoins
- Résumé de ce qui doit être implémenté
- Identification des composants existants à réutiliser (selon architecture.md)

### 2. Éléments Réutilisables (depuis architecture.md)
- Composants existants: [Liste avec référence à architecture.md]
- Services/Helpers existants: [Liste avec référence]
- Patterns à suivre: [Patterns identifiés dans architecture.md]

### 3. Fichiers à Créer
- `path/to/NewComponent.tsx` : [Description et rôle]
- `pages/api/endpoint.ts` : [Description et rôle]

### 4. Fichiers à Modifier (UNIQUEMENT si nécessaire)
- `path/to/ExistingFile.tsx` :
  - Modification: [Description précise]
  - Lignes impactées: [Estimation]
  - Raison: [Pourquoi cette modification est nécessaire]

### 5. Mises à jour architecture.md prévues
- Section Composants: [Ajouts prévus]
- Section Routes API: [Ajouts prévus]
- Autres sections: [Si applicable]

### 6. Séquence d'Implémentation
1. [Première tâche]
2. [Deuxième tâche]
3. [etc.]

### 7. Points de Vigilance
- [Risques identifiés]
- [Dépendances à vérifier]

### 8. Tests à Effectuer
- [Scénario de test 1]
- [Scénario de test 2]
```

**ATTENDRE MA VALIDATION avant de continuer**

#### Étape 2: IMPLÉMENTATION 💻
Après validation du plan:

1. **Implémenter** en suivant EXACTEMENT le plan validé
2. **Respecter** l'architecture Page → Service → API → Supabase
3. **Utiliser** TypeScript avec des types stricts (jamais `any` sauf justification)
4. **Inclure** la gestion d'erreurs appropriée
5. **Ajouter** les commentaires nécessaires (mais pas excessifs)

Format du code:
```typescript
// ✅ BON EXEMPLE
interface PatternData {
  id: string;
  name: string;
  measurements: MeasurementSet;
}

// Gestion d'erreur appropriée
try {
  const result = await patternService.create(data);
  setSuccess(true);
} catch (error) {
  console.error('Failed to create pattern:', error);
  setError('Une erreur est survenue lors de la création');
}
```

#### Étape 3: TESTS MANUELS 🧪
Pour chaque fonctionnalité implémentée:
1. **Tester** le cas nominal (happy path)
2. **Tester** les cas d'erreur
3. **Vérifier** la console pour les erreurs
4. **Confirmer** que les fonctionnalités existantes marchent toujours

#### Étape 4: DOCUMENTATION 📄
1. Créer `./implementation/US_[NUMBER]_implementation.md`:

```markdown
# Implémentation US_[NUMBER]: [Titre]

## Résumé des Modifications
- [Liste des changements effectués]

## Nouveaux Fichiers Créés
- `path/to/file.tsx`: [Description]

## Fichiers Modifiés
- `path/to/modified.tsx`: [Nature des changements]

## Guide de Test
### Comment tester la nouvelle fonctionnalité:
1. Naviguer vers [URL/Page]
2. [Action utilisateur]
3. Vérifier que [Résultat attendu]

### Tests d'erreur:
1. [Scénario d'erreur] → [Comportement attendu]

## Notes Techniques
- [Décisions techniques prises]
- [Patterns utilisés]
```

2. Mettre à jour `./docs/architecture.md` avec:
   - Nouveaux composants créés (section Composants)
   - Nouvelles routes API (section Routes API)
   - Nouveaux services/helpers (sections correspondantes)
   - Mise à jour de l'état du projet
   - Ajout de nouveaux patterns ou conventions introduits

### 4. STRUCTURE DE RÉPONSE ATTENDUE

Ta réponse doit suivre cette structure:

```
## 📋 Plan d'Implémentation US_[NUMBER]

[Plan détaillé comme décrit ci-dessus]

---
**État**: ⏸️ En attente de validation

[Après validation]

## 💻 Implémentation

### 1. Création de [Composant/Fichier]
[Code avec artifacts]

### 2. Modification de [Fichier existant] 
[Explication + code]

### 3. Tests Effectués
✅ Test 1: [Description] - Succès
✅ Test 2: [Description] - Succès

### 4. Documentation
[Contenu du fichier implementation.md]

## ✅ Checklist Finale
- [ ] Architecture.md a été consulté avant l'implémentation
- [ ] Tous les AC sont respectés
- [ ] Aucun code non-lié n'a été modifié  
- [ ] Tests manuels passés
- [ ] Pas d'erreurs console
- [ ] Documentation implementation créée
- [ ] Toutes les clés des traductions sont présentes dans le fichier './public/locales/en/translation.json'
- [ ] Architecture.md mis à jour avec les nouveaux éléments
```

### 5. RAPPELS CRITIQUES ⚠️

1. **FOCUS**: Reste concentré UNIQUEMENT sur la US fournie
2. **RÉUTILISATION**: Toujours vérifier si un composant similaire existe
3. **TESTS**: Ne jamais considérer le travail terminé sans tests
4. **PRESERVATION**: Le code existant qui fonctionne ne doit JAMAIS être cassé

## 🚀 PRÊT À COMMENCER

La User Story à implémenter est fournie en référence. Commence par analyser et proposer ton plan d'implémentation.

---
