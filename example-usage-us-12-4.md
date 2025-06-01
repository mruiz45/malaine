# Exemple d'Utilisation - US_12.4 : Génération d'Instructions pour Manches Marteau

## Vue d'Ensemble

Cette documentation présente l'utilisation du générateur d'instructions pour manches marteau (US_12.4), qui génère des instructions textuelles détaillées pour tricoter/crocheter les manches marteau et les panneaux de corps correspondants.

## Données d'Entrée

### Calculs de Manches Marteau (US_12.3)

```typescript
const hammerSleeveCalculations: HammerSleeveCalculations = {
  hammer_sleeve_shaping: {
    sleeve_cap_extension: {
      width_stitches: 20,
      length_rows: 10,
      shaping_to_neck_details: []
    },
    sleeve_cap_vertical_part: {
      width_stitches: 60,
      height_rows: 40,
      shaping_from_arm_details: []
    }
  },
  body_panel_hammer_armhole_shaping: {
    shoulder_strap_width_stitches: 25,
    armhole_cutout_width_stitches: 60,
    armhole_depth_rows: 40,
    bind_off_for_cutout_stitches: 60,
    body_width_at_chest_stitches: 170
  },
  calculation_metadata: {
    actual_shoulder_width_cm: 45.0,
    actual_upper_arm_width_cm: 30.0,
    actual_armhole_depth_cm: 20.0
  }
};
```

### Contexte de Génération

```typescript
const context: HammerSleeveInstructionContext = {
  craftType: 'knitting',
  hammerSleeveCalculations,
  componentKey: 'hammer_sleeve_sweater',
  componentDisplayName: 'Pull à Manches Marteau',
  config: {
    includeStitchCounts: true,
    includeRowNumbers: true,
    useSpecificTechniques: true,
    language: 'fr', // Support français
    verbosity: 'standard'
  },
  // Optionnel : logique de manche fuselée intégrée
  sleeveShapingSchedule: {
    shapingEvents: [
      {
        type: 'increase',
        totalStitchesToChange: 20,
        stitchesPerEvent: 2,
        numShapingEvents: 10,
        instructionsTextSimple: 'Augmenter 2 mailles tous les 4 rangs 10 fois',
        detailedBreakdown: [...]
      }
    ],
    hasShaping: true,
    totalShapingRows: 40
  }
};
```

## Génération des Instructions

```typescript
import { generateHammerSleeveInstructions } from '@/utils/hammer-sleeve-instruction-generator';

const result = generateHammerSleeveInstructions(context);

if (result.success) {
  console.log('Instructions générées avec succès !');
  console.log('Résumé:', result.summary);
  
  // Accès aux instructions par composant
  const sleeveInstructions = result.instructions.sleeve;
  const frontBodyInstructions = result.instructions.front_body;
  const backBodyInstructions = result.instructions.back_body;
  const assemblyInstructions = result.instructions.assembly;
} else {
  console.error('Erreur:', result.error);
}
```

## Instructions Générées - Exemple en Français

### 1. Instructions pour la Manche

```
Étape 1: Monter 60 mailles. (60 m)

Étape 2: Continuer en Point Jersey, tricoter 20 rangs. (60 m)

Étape 3: Rang 21 (End - Rang d'augmentation): 1 m end, 1 aug interc à gauche, tricoter jusqu'à la dernière m, 1 aug interc à droite, 1 m end. (62 m)

... [autres rangs de façonnage fuselé] ...

Étape 12: Tricoter droit en Point Jersey pendant 40 rangs (partie verticale de la tête de manche). (80 m)

Étape 13: Continuer avec les 20 mailles centrales seulement (mettre les 30 mailles restantes de chaque côté en attente). Tricoter en Point Jersey pendant 10 rangs pour former l'extension d'épaule. (20 m)
```

### 2. Instructions pour le Devant du Corps

```
Étape 1: Devant: Monter 170 mailles. (170 m)

Étape 2: Tricoter en Point Jersey pendant 80 rangs jusqu'à la hauteur d'emmanchure. (170 m)

Étape 3: Tricoter 25 mailles (bretelle d'épaule gauche), rabattre 60 mailles (découpe emmanchure), tricoter 60 mailles (encolure/centre), rabattre 60 mailles, tricoter 25 mailles (bretelle d'épaule droite). (110 m)

Étape 4: Continuer sur la bretelle d'épaule gauche seulement (25 mailles). Tricoter en Point Jersey pendant 40 rangs. (25 m)

Étape 5: Continuer sur la bretelle d'épaule droite seulement (25 mailles). Tricoter en Point Jersey pendant 40 rangs. (25 m)
```

### 3. Instructions pour le Dos du Corps

```
Étape 1: Dos: Monter 170 mailles. (170 m)

Étape 2: Tricoter en Point Jersey pendant 80 rangs jusqu'à la hauteur d'emmanchure. (170 m)

Étape 3: Tricoter 25 mailles (bretelle d'épaule gauche), rabattre 60 mailles (découpe emmanchure), tricoter 60 mailles (encolure/centre), rabattre 60 mailles, tricoter 25 mailles (bretelle d'épaule droite). (110 m)

Étape 4: Continuer sur la bretelle d'épaule gauche seulement (25 mailles). Tricoter en Point Jersey pendant 40 rangs. (25 m)

Étape 5: Continuer sur la bretelle d'épaule droite seulement (25 mailles). Tricoter en Point Jersey pendant 40 rangs. (25 m)
```

### 4. Instructions d'Assemblage

```
Étape 1: Joindre les extensions de manche aux bretelles d'épaule du corps en utilisant la couture.

Étape 2: Coudre les coutures latérales et les coutures sous les bras.

Étape 3: Rentrer tous les fils et bloquer aux mesures.
```

## Instructions Générées - Exemple en Anglais

### 1. Sleeve Instructions

```
Step 1: Cast on 60 stitches. (60 sts)

Step 2: Continue in Stockinette Stitch, work 20 rows plain. (60 sts)

Step 3: Row 21 (RS - Increase Row): K1, M1L, knit to last st, M1R, k1. (62 sts)

... [other tapered shaping rows] ...

Step 12: Work straight in Stockinette Stitch for 40 rows (vertical part of sleeve cap). (80 sts)

Step 13: Continue with center 20 stitches only (place remaining 30 stitches each side on hold). Work in Stockinette Stitch for 10 rows to form shoulder extension. (20 sts)
```

### 2. Front Body Instructions

```
Step 1: Front: Cast on 170 stitches. (170 sts)

Step 2: Work in Stockinette Stitch for 80 rows to armhole height. (170 sts)

Step 3: Knit 25 stitches (left shoulder strap), bind off 60 stitches (armhole cutout), knit 25 stitches (right shoulder strap). (110 sts)

Step 4: Continue on left shoulder strap only (25 stitches). Work in Stockinette Stitch for 40 rows. (25 sts)

Step 5: Continue on right shoulder strap only (25 stitches). Work in Stockinette Stitch for 40 rows. (25 sts)
```

## Support du Crochet

Le générateur supporte également le crochet avec des instructions adaptées :

```
Étape 1: Faire 61 mailles en l'air. Bride simple dans la 2e maille en l'air à partir du crochet et dans chaque maille en l'air. (60 bs)

Étape 2: Continuer en Bride Simple, tricoter 20 rangs. (60 bs)

Étape 3: Rang 21 (Rang d'augmentation): 1 bs, 2 bs dans la m suiv, bs jusqu'à la dernière m, 2 bs dans la dernière m. (62 bs)
```

## Métadonnées des Instructions

Chaque instruction inclut des métadonnées détaillées :

```typescript
{
  step: 1,
  type: 'cast_on',
  text: 'Monter 60 mailles. (60 m)',
  stitchCount: 60,
  metadata: {
    hammer_sleeve: {
      step_type: 'main_sleeve_cast_on',
      hammer_sleeve_step: 1,
      component: 'sleeve_main',
      component_width_stitches: 60
    }
  }
}
```

## Intégration avec les Services

```typescript
// Dans InstructionGeneratorService
const instructionService = new InstructionGeneratorService();

const result = instructionService.generateHammerSleeveInstructions(
  hammerSleeveCalculations,
  context,
  config
);
```

## Résumé de Sortie

```typescript
{
  success: true,
  instructions: {
    sleeve: DetailedInstruction[],      // 13 instructions
    front_body: DetailedInstruction[], // 5 instructions
    back_body: DetailedInstruction[],  // 5 instructions
    assembly: DetailedInstruction[]    // 3 instructions
  },
  summary: {
    totalInstructions: 26,
    totalRows: 160,
    components: ['sleeve', 'front_body', 'back_body', 'assembly']
  },
  warnings: [] // Optionnel
}
```

## Points Clés d'Implémentation

1. **FR2 - Instructions de Manche** : 
   - Partie principale avec façonnage fuselé optionnel (US_7.2/7.3)
   - Partie verticale droite sur la hauteur d'emmanchure
   - Extension d'épaule tricotée en continuité

2. **FR3 - Instructions de Corps** :
   - Rabat clair pour la découpe d'emmanchure avec comptes de mailles
   - Continuation séparée sur les bretelles d'épaule

3. **FR4 - Comptes de Mailles** : Indiqués à chaque étape clé

4. **FR5 - Assemblage** : Instructions spécifiques pour joindre l'extension tricotée en continuité

5. **Support Multilingue** : Instructions en français et anglais
6. **Support Multi-Craft** : Tricot et crochet avec terminologie appropriée
7. **Intégration US_7.2/7.3** : Logique de manche fuselée intégrée 