# Générateur d'Instructions pour Châles Triangulaires (US_12.6)

## Vue d'ensemble

Le générateur d'instructions pour châles triangulaires convertit les calculs de US_12.5 en instructions textuelles détaillées et claires pour les tricoteurs et crocheteurs. Il supporte les trois méthodes de construction principales avec une terminologie appropriée selon la technique utilisée.

## Méthodes de Construction Supportées

### 1. Top-Down Center-Out (Du haut vers le bas, du centre vers l'extérieur)
- **Usage** : Châles commençant par le centre du bord supérieur
- **Caractéristiques** : 
  - Montage minimal (3 mailles typiquement)
  - Placement de marqueurs pour l'épine centrale
  - Augmentations symétriques (4 augmentations par rang)
  - Forme triangulaire classique

### 2. Side-to-Side (D'un côté à l'autre)
- **Usage** : Châles travaillés d'une pointe à l'autre
- **Caractéristiques** :
  - Montage modéré (4-6 mailles)
  - Phase d'augmentation puis de diminution
  - Transition claire entre les phases
  - Forme asymétrique possible

### 3. Bottom-Up (Du bas vers le haut)
- **Usage** : Châles commençant par l'envergure complète
- **Caractéristiques** :
  - Montage important (envergure complète)
  - Diminutions symétriques aux extrémités
  - Finition en pointe
  - Forme triangulaire classique

## Utilisation de l'API

### Import des modules

```typescript
import { 
  generateTriangularShawlInstructions,
  TriangularShawlInstructionContext,
  TriangularShawlInstructionResult
} from '@/utils/triangular-shawl-instruction-generator';
import { TriangularShawlCalculations } from '@/types/triangular-shawl';
import { InstructionGenerationConfig } from '@/types/instruction-generation';
```

### Configuration

```typescript
const config: InstructionGenerationConfig = {
  includeStitchCounts: true,      // Inclure les comptages de mailles
  includeRowNumbers: true,        // Inclure les numéros de rangs
  useSpecificTechniques: true,    // Utiliser les techniques spécifiques (M1L, M1R, etc.)
  language: 'fr',                 // 'en' pour anglais, 'fr' pour français
  verbosity: 'standard'           // 'minimal', 'standard', 'detailed'
};
```

### Génération d'instructions

```typescript
const context: TriangularShawlInstructionContext = {
  craftType: 'knitting',               // 'knitting' ou 'crochet'
  triangularShawlCalculations,         // Résultat de US_12.5
  componentKey: 'triangular_shawl',
  componentDisplayName: 'Châle Triangulaire',
  config
};

const result: TriangularShawlInstructionResult = generateTriangularShawlInstructions(context);

if (result.success) {
  console.log(`Instructions générées: ${result.instructions?.length} étapes`);
  console.log(`Nombre total de rangs: ${result.summary?.totalRows}`);
  
  result.instructions?.forEach(instruction => {
    console.log(`Étape ${instruction.step}: ${instruction.text}`);
  });
} else {
  console.error('Erreur:', result.error);
}
```

## Techniques Utilisées

### Tricot (Knitting)

#### Augmentations
- **M1L** (Make 1 Left) : Augmentation inclinée à gauche
- **M1R** (Make 1 Right) : Augmentation inclinée à droite  
- **KFB** (Knit Front and Back) : Tricoter devant et derrière
- **YO** (Yarn Over) : Jeté

#### Diminutions
- **K2tog** : Tricoter 2 mailles ensemble (incliné à droite)
- **SSK** (Slip, Slip, Knit) : Diminution inclinée à gauche
- **CDD** (Central Double Decrease) : Double diminution centrale

### Crochet

#### Augmentations
- **2 sc in next st** : 2 brides dans la maille suivante
- **ch 1, sc in same st** : Chaînette et bride dans la même maille

#### Diminutions
- **sc2tog** : Bride 2 mailles ensemble
- **skip next st** : Sauter la maille suivante

## Exemples d'Instructions Générées

### Top-Down Center-Out (Tricot, Français)

```
Étape 1: Monter 3 mailles.
Étape 2: Rang de mise en place : Tricoter 1 maille, placer un marqueur, tricoter 1 maille (maille centrale), placer un marqueur, tricoter 1 maille.
Étape 3: Rang Endroit (Augmentation) : Tricoter 1, M1R, tricoter jusqu'à 1 maille avant le marqueur central, M1R, tricoter 1 (maille centrale), M1L, tricoter jusqu'au dernier marqueur/maille, M1L, tricoter 1. (4 augmentations par rang)
Étape 4: Rang Envers : Tricoter à l'envers tous les mailles.
Étape 5: Répéter ces 2 rangs 105 fois au total.
Étape 6: Rabattre toutes les 423 mailles.
```

### Side-to-Side (Crochet, Anglais)

```
Step 1: Chain 5. Single crochet in 2nd chain from hook and in each chain across. (4 sc)
Step 2: Increase Row: 2 sc in next st in first stitch, sc to end. (1 increase per right side row)
Step 3: Plain Row: Single crochet in each stitch.
Step 4: Repeat these 2 rows 146 times total to reach maximum depth.
Step 5: Transition: You have now reached the maximum depth of the shawl. Begin the decrease phase to form the second half.
Step 6: Decrease Row: Skip first stitch, sc to end. (1 decrease per right side row)
Step 7: Plain Row: Single crochet in each stitch.
Step 8: Repeat these 2 rows 146 times total to return to starting point.
Step 9: Fasten off and weave in ends.
```

## Intégration avec le Service

### Via InstructionGeneratorService

```typescript
import { InstructionGeneratorService } from '@/services/instructionGeneratorService';

const instructionService = new InstructionGeneratorService();

const result = instructionService.generateTriangularShawlInstructions(
  triangularShawlCalculations,
  {
    craftType: 'knitting',
    componentKey: 'triangular_shawl',
    componentDisplayName: 'Châle Triangulaire',
    startingStitchCount: calculations.setup.cast_on_stitches,
    finalStitchCount: calculations.final_stitch_count
  },
  config
);
```

## Gestion d'Erreurs et Avertissements

### Erreurs Communes
- **Méthode de construction non supportée** : Vérifiez que la `construction_method` est valide
- **Données manquantes** : Assurez-vous que les calculs US_12.5 sont complets
- **Configuration invalide** : Vérifiez les paramètres de configuration

### Avertissements
- **Phases manquantes** : Si certaines phases de façonnage sont absentes
- **Comptages incohérents** : Si les comptages de mailles ne correspondent pas
- **Avertissements des calculs US_12.5** : Propagés depuis les calculs de base

## Bonnes Pratiques

1. **Validation des données** : Toujours vérifier que les calculs US_12.5 sont valides avant génération
2. **Configuration appropriée** : Adapter la configuration selon le public cible
3. **Gestion des erreurs** : Implémenter une gestion robuste des cas d'erreur
4. **Tests** : Valider avec différentes configurations et méthodes de construction

## Support Multilingue

Le générateur supporte:
- **Anglais** (`'en'`) : Terminologie anglophone standard
- **Français** (`'fr'`) : Terminologie francophone appropriée

Chaque langue utilise la terminologie correcte pour les techniques de tricot/crochet et les instructions générales.

## Extensibilité

Le système est conçu pour être facilement extensible:
- Nouvelles méthodes de construction via l'ajout de fonctions spécialisées
- Nouvelles langues via l'extension des templates de traduction  
- Nouvelles techniques via l'ajout aux constantes de techniques par défaut
- Formats de sortie alternatifs via la modification de l'interface `DetailedInstruction` 