# US_11.4 - Génération d'Instructions d'Emmanchures

## Exemples d'Utilisation

### 1. Exemple d'Emmanchure Arrondie (Manche Sertie)

```typescript
import { InstructionGeneratorService } from '@/services/instructionGeneratorService';
import { ArmholeShapingSchedule } from '@/types/armhole-shaping';
import { InstructionGenerationContext } from '@/types/instruction-generation';

const service = new InstructionGeneratorService();

// Planning d'emmanchure arrondie calculé par US_11.3
const roundedArmholeSchedule: ArmholeShapingSchedule = {
  type: 'rounded_set_in',
  base_bind_off_stitches: 3,
  shaping_details: [
    {
      action: 'decrease',
      stitches: 2,
      on_row_from_start_of_shaping: 3,
      side_of_fabric: 'RS'
    },
    {
      action: 'decrease',
      stitches: 1,
      on_row_from_start_of_shaping: 5,
      side_of_fabric: 'RS',
      repeats: 6,
      every_x_rows: 2
    }
  ],
  total_rows_for_shaping: 16,
  final_stitches_at_shoulder_edge: 32
};

const context: InstructionGenerationContext = {
  craftType: 'knitting',
  componentKey: 'front_panel',
  componentDisplayName: 'Front Panel',
  startingStitchCount: 96,
  finalStitchCount: 74,
  armholeShapingSchedule: roundedArmholeSchedule
};

const result = service.generateArmholeInstructions(roundedArmholeSchedule, context);

console.log('Instructions générées:');
result.instructions?.forEach(instruction => {
  console.log(`${instruction.step}: ${instruction.text}`);
});
```

**Sortie attendue :**
```
1: Row 1 (RS) - Begin armhole shaping: bind off 3 sts at beginning of row, knit to last 3 sts, bind off last 3 sts. (90 sts)
2: Row 3 (RS - Decrease): decrease 2 sts at each end. (86 sts)
3: Row 5 (RS - Decrease): decrease 1 st at each end. (84 sts)
4: Repeat armhole decreases every 2 rows 5 more times.
```

### 2. Exemple d'Emmanchure Raglan

```typescript
const raglanArmholeSchedule: ArmholeShapingSchedule = {
  type: 'raglan',
  base_bind_off_stitches: 6,
  shaping_details: [
    {
      action: 'decrease',
      stitches: 1,
      on_row_from_start_of_shaping: 3,
      side_of_fabric: 'RS',
      repeats: 25,
      every_x_rows: 2
    }
  ],
  total_rows_for_shaping: 52,
  final_stitches_at_shoulder_edge: 16
};

const raglanContext: InstructionGenerationContext = {
  craftType: 'knitting',
  componentKey: 'front_panel',
  componentDisplayName: 'Front Panel',
  startingStitchCount: 96,
  finalStitchCount: 40,
  armholeShapingSchedule: raglanArmholeSchedule
};

const raglanResult = service.generateArmholeInstructions(raglanArmholeSchedule, raglanContext);
```

**Sortie attendue pour Raglan :**
```
1: Row 1 (RS) - Begin armhole shaping: bind off 6 sts at beginning of row, knit to last 6 sts, bind off last 6 sts. (84 sts)
2: Row 3 (RS - Raglan): decrease 1 st each side of raglan marker. (82 sts)
3: Repeat armhole decreases every 2 rows 24 more times.
```

### 3. Instructions avec Techniques Spécifiques (Tricot)

```typescript
const specificTechniquesConfig = {
  includeStitchCounts: true,
  includeRowNumbers: true,
  useSpecificTechniques: true,
  language: 'en' as const,
  verbosity: 'standard' as const
};

const resultWithTechniques = service.generateArmholeInstructions(
  roundedArmholeSchedule, 
  context, 
  specificTechniquesConfig
);
```

**Sortie avec techniques spécifiques :**
```
1: Row 1 (RS) - Begin armhole shaping: bind off 3 sts at beginning of row, knit to last 3 sts, bind off last 3 sts. (90 sts)
2: Row 3 (RS - Decrease): k1, ssk, knit to last 3 sts, k2tog, k1. (86 sts)
3: Row 5 (RS - Decrease): k1, ssk, knit to last 3 sts, k2tog, k1. (84 sts)
4: Repeat armhole decreases every 2 rows 5 more times.
```

### 4. Instructions en Français

```typescript
const frenchConfig = {
  includeStitchCounts: true,
  includeRowNumbers: true,
  useSpecificTechniques: false,
  language: 'fr' as const,
  verbosity: 'standard' as const
};

const frenchResult = service.generateArmholeInstructions(
  roundedArmholeSchedule, 
  context, 
  frenchConfig
);
```

**Sortie en français :**
```
1: Rang 1 (Endroit) - Commencer le façonnage des emmanchures: rabattre 3 m au début du rang, tricoter à l'endroit jusqu'à 3 m de la fin, rabattre les 3 dernières m. (90 m)
2: Rang 3 (Endroit - Diminution): diminuer 2 m de chaque côté. (86 m)
3: Rang 5 (Endroit - Diminution): diminuer 1 m de chaque côté. (84 m)
4: Répéter diminution aux emmanchures tous les 2 rangs encore 5 fois.
```

### 5. Instructions pour Tête de Manche

```typescript
import { SleeveCapShapingSchedule } from '@/types/armhole-shaping';

const sleeveCapSchedule: SleeveCapShapingSchedule = {
  type: 'rounded_set_in',
  initial_stitches: 52,
  cap_shaping_details: [
    {
      action: 'decrease',
      stitches: 3,
      on_row_from_start_of_shaping: 1,
      side_of_fabric: 'RS'
    },
    {
      action: 'decrease',
      stitches: 1,
      on_row_from_start_of_shaping: 3,
      side_of_fabric: 'RS',
      repeats: 12,
      every_x_rows: 2
    }
  ],
  total_cap_rows: 26,
  final_cap_stitches: 16
};

const sleeveContext: InstructionGenerationContext = {
  craftType: 'knitting',
  componentKey: 'sleeve',
  componentDisplayName: 'Sleeve',
  startingStitchCount: 52,
  finalStitchCount: 16
};

const sleeveCapResult = service.generateSleeveCapInstructions(sleeveCapSchedule, sleeveContext);
```

### 6. Intégration avec le Flux Principal

```typescript
// Génération complète incluant les emmanchures
const completeContext: InstructionGenerationContext = {
  craftType: 'knitting',
  componentKey: 'front_panel',
  componentDisplayName: 'Front Panel',
  startingStitchCount: 96,
  finalStitchCount: 32,
  armholeShapingSchedule: roundedArmholeSchedule
};

const completeResult = service.generateDetailedInstructionsWithShaping(completeContext);

// Les instructions incluront automatiquement :
// 1. Cast-on initial
// 2. Corps du tricot
// 3. Instructions d'emmanchures (intégrées automatiquement)
// 4. Rabattage final si nécessaire
```

## Fonctionnalités Supportées

### Types d'Emmanchures
- **Emmanchure arrondie** (`rounded_set_in`) : Pour manches serties traditionnelles
- **Emmanchure raglan** (`raglan`) : Avec références aux marqueurs raglan

### Actions Supportées
- Rabattage de base (`base_bind_off`)
- Diminutions progressives (`decrease`)
- Répétitions avec intervalles (`repeats` + `every_x_rows`)

### Terminologie
- **Tricot vs Crochet** : Terminologie spécifique automatique
- **Langues** : Anglais et français supportés
- **Techniques spécialisées** : SSK, k2tog, M1L, M1R pour le tricot

### Métadonnées Générées
- Côté du tissu (endroit/envers)
- Nombre de mailles affectées
- Position dans la séquence d'emmanchure
- Information sur les marqueurs raglan

### Configuration Flexible
- Inclusion/exclusion des comptes de mailles
- Niveau de détail technique
- Support multilingue
- Intégration avec motifs de points

Cette implémentation complète US_11.4 en fournissant un système robuste et flexible pour générer des instructions textuelles d'emmanchures complexes. 