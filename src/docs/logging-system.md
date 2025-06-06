# Système de Logging Pattern Design - Malaine

## Vue d'ensemble

Le système de logging de Malaine permet de tracer et enregistrer toutes les activités liées à la conception de modèles (pattern design) dans un fichier dédié `pattern-design.log`. Ce système suit l'architecture en couches de Malaine et offre une solution robuste pour le débogage et l'analyse des comportements utilisateur.

## Architecture

### Structure en Couches
```
Page/Composant → Service → API → Fichier Log
```

- **Page/Composant** : Utilise `usePatternLogger` hook ou `LoggingService` directement
- **Service** : `LoggingService` gère la logique côté client et l'envoi vers l'API
- **API** : Route `/api/log` reçoit et persiste les logs
- **Fichier** : `logs/pattern-design.log` stocke les entrées de log

### Fichiers Principaux

- `src/types/logging.ts` - Interfaces TypeScript
- `src/utils/logger.ts` - Utilitaires de logging
- `src/services/LoggingService.ts` - Service côté client
- `src/hooks/usePatternLogger.ts` - Hook React custom
- `src/app/api/log/route.ts` - Route API serveur
- `src/components/examples/PatternDesignExample.tsx` - Exemple d'usage

## Types d'Événements Loggés

### Événements Principaux
- `GARMENT_TYPE_SELECTED` - Sélection du type de vêtement
- `MEASUREMENT_UPDATED` - Mise à jour des mesures
- `NECKLINE_TYPE_CHANGED` - Changement du type d'encolure
- `SLEEVE_TYPE_CHANGED` - Changement du type de manche
- `FIT_PREFERENCE_CHANGED` - Modification des préférences de coupe
- `UNDO_TRIGGERED` / `REDO_TRIGGERED` - Actions d'annulation/rétablissement
- `RESTORE_POINT_CREATED` / `RESTORE_POINT_RESTORED` - Gestion des points de restauration
- `PATTERN_CALCULATION_STARTED` / `COMPLETED` / `ERROR` - Calculs de modèles
- `VALIDATION_ERROR` - Erreurs de validation
- `COMPONENT_INITIALIZED` - Initialisation des composants
- `ERROR_OCCURRED` - Erreurs générales

### Niveaux de Log
- `DEBUG` - Informations de développement
- `INFO` - Informations générales
- `WARN` - Avertissements
- `ERROR` - Erreurs

## Utilisation

### Option 1 : Hook usePatternLogger (Recommandé)

```typescript
import { usePatternLogger } from '@/hooks/usePatternLogger';

function MyPatternComponent() {
  const logger = usePatternLogger({
    componentName: 'MyPatternComponent',
    logInitialization: true,
  });

  const handleGarmentChange = (newType: string, oldType?: string) => {
    setGarmentType(newType);
    logger.logGarmentTypeSelected(newType, oldType);
  };

  const handleMeasurementChange = (field: string, newValue: string, oldValue: string) => {
    setMeasurement(field, newValue);
    logger.logMeasurementUpdated(field, oldValue, newValue, 'cm');
  };

  const handleError = (error: Error) => {
    logger.logError(error, 'Pattern calculation failed');
  };

  return (
    // ... votre JSX
  );
}
```

### Option 2 : Service Direct

```typescript
import { getLoggingService } from '@/services/LoggingService';

function MyPatternComponent() {
  const loggingService = getLoggingService();

  const handleAction = () => {
    loggingService.log('INFO', 'USER_INPUT_CHANGED', {
      inputName: 'customField',
      oldValue: oldVal,
      newValue: newVal,
    }, 'MyPatternComponent');
  };
}
```

### Option 3 : HOC (Higher-Order Component)

```typescript
import { withPatternLogger } from '@/hooks/usePatternLogger';

function MyComponent({ logger }: { logger: PatternLoggerHook }) {
  const handleClick = () => {
    logger.logUserInputChanged('button', null, 'clicked');
  };

  return <button onClick={handleClick}>Action</button>;
}

export default withPatternLogger(MyComponent, {
  componentName: 'MyComponent',
  logInitialization: true,
});
```

## Format des Logs

### Structure JSON
```json
{
  "timestamp": "2025-01-15T14:30:00.000Z",
  "level": "INFO",
  "event": "GARMENT_TYPE_SELECTED",
  "details": {
    "type": "sweater",
    "previousType": "cardigan"
  },
  "sessionId": "session_1642257000000_abc123def",
  "userId": "user_uuid_here",
  "component": "PatternDesignExample",
  "serverTimestamp": "2025-01-15T14:30:00.500Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.100"
}
```

### Exemples d'Entrées de Log

#### Sélection de Type de Vêtement
```json
{
  "timestamp": "2025-01-15T14:30:00.000Z",
  "level": "INFO",
  "event": "GARMENT_TYPE_SELECTED",
  "details": {
    "type": "sweater",
    "previousType": "cardigan"
  },
  "sessionId": "session_1642257000000_abc123def",
  "component": "PatternSelector"
}
```

#### Mise à Jour de Mesure
```json
{
  "timestamp": "2025-01-15T14:31:00.000Z",
  "level": "INFO",
  "event": "MEASUREMENT_UPDATED",
  "details": {
    "field": "chest",
    "oldValue": "95",
    "newValue": "100",
    "unit": "cm"
  },
  "sessionId": "session_1642257000000_abc123def",
  "component": "MeasurementInput"
}
```

#### Erreur de Calcul
```json
{
  "timestamp": "2025-01-15T14:32:00.000Z",
  "level": "ERROR",
  "event": "PATTERN_CALCULATION_ERROR",
  "details": {
    "error": {
      "message": "Invalid measurement values",
      "stack": "Error: Invalid measurement values\n    at calculatePattern...",
      "code": "VALIDATION_ERROR"
    },
    "calculationType": "basic_sweater"
  },
  "sessionId": "session_1642257000000_abc123def",
  "component": "PatternCalculator"
}
```

## Configuration

### Configuration par Défaut
```typescript
const DEFAULT_LOGGING_CONFIG = {
  minLevel: 'INFO',
  batchSize: 10,
  flushInterval: 5000, // 5 secondes
  includeStateSnapshots: process.env.NODE_ENV === 'development',
  enabled: true,
};
```

### Personnaliser la Configuration
```typescript
const logger = usePatternLogger({
  componentName: 'MyComponent',
  minLevel: 'DEBUG',
  batchSize: 5,
  flushInterval: 3000,
  includeStateSnapshots: true,
});
```

## Gestion des Fichiers de Log

### Localisation
- Fichier principal : `logs/pattern-design.log`
- Fichiers rotés : `logs/pattern-design-YYYY-MM-DDTHH-MM-SS.log`

### Rotation Automatique
- Taille maximum : 10MB
- Rotation automatique lors de l'écriture
- Conservation des anciens fichiers avec timestamp

### Surveillance
Endpoint de monitoring : `GET /api/log`
```json
{
  "status": "healthy",
  "logFile": {
    "exists": true,
    "path": "/path/to/logs/pattern-design.log",
    "size": 1024576,
    "lastModified": "2025-01-15T14:30:00.000Z",
    "maxSize": 10485760
  },
  "logsDirectory": "/path/to/logs"
}
```

## Tests et Validation

### Critères d'Acceptation (PD_PH3_US003)

1. **Test des Actions** : Effectuer une série d'actions dans l'UI de conception de modèles
2. **Vérification des Logs** : Confirmer que les entrées correspondantes sont générées
3. **Format Structuré** : Vérifier que les logs sont structurés et contiennent les détails pertinents
4. **Gestion d'Erreurs** : Simuler une erreur et vérifier qu'elle est loggée

### Exemple de Test
```typescript
// Utiliser le composant PatternDesignExample
// 1. Sélectionner un type de vêtement
// 2. Modifier des mesures
// 3. Changer le type d'encolure
// 4. Effectuer une action d'annulation
// 5. Créer un point de restauration
// 6. Déclencher une erreur de calcul

// Vérifier les logs dans logs/pattern-design.log
```

## Débogage

### Console de Développement
- Les erreurs de logging sont affichées dans la console
- Le service de logging affiche les statistiques d'envoi

### Points de Vérification
1. Vérifier que le service de logging est initialisé
2. Confirmer que les logs sont ajoutés au buffer
3. Vérifier l'envoi vers l'API
4. Confirmer l'écriture dans le fichier

### Problèmes Courants
- **Logs non envoyés** : Vérifier la configuration réseau et l'endpoint API
- **Fichier non créé** : Vérifier les permissions d'écriture du répertoire `logs/`
- **Performance** : Ajuster `batchSize` et `flushInterval` si nécessaire

## Bonnes Pratiques

1. **Nommage des Composants** : Utilisez des noms explicites pour `componentName`
2. **Gestion d'Erreurs** : Toujours logger les erreurs avec du contexte
3. **Niveau de Log** : Utilisez le niveau approprié (DEBUG/INFO/WARN/ERROR)
4. **Données Sensibles** : Évitez de logger des données sensibles ou personnelles
5. **Performance** : Ne loggez pas d'événements trop fréquents au niveau DEBUG en production

## Extension du Système

### Ajouter un Nouveau Type d'Événement
1. Ajouter le type dans `PatternDesignEventType` (types/logging.ts)
2. Créer une interface de détails si nécessaire
3. Ajouter une méthode dans `LoggingService`
4. Ajouter une méthode dans le hook `usePatternLogger`

### Personnaliser le Format de Log
Modifier la fonction `formatLogEntry` dans `src/app/api/log/route.ts`

---

Ce système de logging offre une traçabilité complète des activités de conception de modèles pour faciliter le débogage et l'amélioration continue de l'expérience utilisateur. 