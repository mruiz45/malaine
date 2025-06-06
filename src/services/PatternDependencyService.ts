import { 
  PatternState, 
  SleevesData, 
  BodyStructureData 
} from '@/types/pattern';
import { LoggingService } from './LoggingService';

/**
 * Types of dependencies between pattern sections
 */
export type DependencyType = 
  | 'sleeve_type_affects_armhole'
  | 'construction_affects_measurements'
  | 'neckline_affects_calculations';

/**
 * Dependency definition interface
 */
export interface PatternDependency {
  sourceSection: string;
  sourceField: string;
  targetSection: string;
  targetFields: string[];
  dependencyType: DependencyType;
  description: string;
}

/**
 * Dependency change event interface
 */
export interface DependencyChangeEvent {
  dependency: PatternDependency;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

/**
 * Service for managing pattern section dependencies (PD_PH4_US003)
 * Handles detection and flagging of interdependent calculations
 */
export class PatternDependencyService {
  private loggingService: LoggingService;
  private dependencies: PatternDependency[];

  constructor(loggingService: LoggingService) {
    this.loggingService = loggingService;
    this.dependencies = this.initializeDependencies();
  }

  /**
   * Initialize known dependencies between pattern sections
   */
  private initializeDependencies(): PatternDependency[] {
    return [
      {
        sourceSection: 'sleeves',
        sourceField: 'sleeveType',
        targetSection: 'bodyStructure',
        targetFields: ['armholeRequiresRecalculation'],
        dependencyType: 'sleeve_type_affects_armhole',
        description: 'Sleeve type changes affect armhole shape calculations'
      }
      // Future dependencies can be added here
    ];
  }

  /**
   * Check for dependencies when sleeves section is updated
   * @param oldSleeves - Previous sleeves data
   * @param newSleeves - New sleeves data
   * @param currentState - Current pattern state
   * @returns Updated pattern state with dependency flags
   */
  public handleSleevesUpdate(
    oldSleeves: SleevesData,
    newSleeves: SleevesData,
    currentState: PatternState
  ): PatternState {
    // Check if sleeve type has changed
    if (oldSleeves.sleeveType !== newSleeves.sleeveType) {
      return this.handleSleeveTypeChange(
        oldSleeves.sleeveType,
        newSleeves.sleeveType,
        currentState
      );
    }

    return currentState;
  }

  /**
   * Handle sleeve type change and update dependent sections
   * @param oldSleeveType - Previous sleeve type
   * @param newSleeveType - New sleeve type
   * @param currentState - Current pattern state
   * @returns Updated pattern state
   */
  private handleSleeveTypeChange(
    oldSleeveType: SleevesData['sleeveType'],
    newSleeveType: SleevesData['sleeveType'],
    currentState: PatternState
  ): PatternState {
    // Find relevant dependency
    const dependency = this.dependencies.find(
      dep => dep.sourceSection === 'sleeves' && 
             dep.sourceField === 'sleeveType' &&
             dep.dependencyType === 'sleeve_type_affects_armhole'
    );

    if (!dependency) {
      return currentState;
    }

    // Log the dependency detection
    this.loggingService.log('INFO', 'SLEEVE_TYPE_DEPENDENCY_DETECTED', {
      oldSleeveType: oldSleeveType || 'null',
      newSleeveType: newSleeveType || 'null',
      affectedSections: [dependency.targetSection]
    });

    // Update body structure to flag armhole recalculation
    const updatedBodyStructure: BodyStructureData = {
      ...currentState.bodyStructure,
      armholeRequiresRecalculation: true
    };

    // Log the recalculation flagging
    this.loggingService.log('INFO', 'BODY_STRUCTURE_RECALCULATION_FLAGGED', {
      triggerSection: 'sleeves',
      triggerEvent: 'sleeveType_changed',
      flaggedCalculations: ['armhole']
    });

    return {
      ...currentState,
      bodyStructure: updatedBodyStructure
    };
  }

  /**
   * Get all dependencies for a given section
   * @param sectionName - Name of the section
   * @returns Array of dependencies
   */
  public getDependenciesForSection(sectionName: string): PatternDependency[] {
    return this.dependencies.filter(
      dep => dep.sourceSection === sectionName || dep.targetSection === sectionName
    );
  }

  /**
   * Check if a section has pending recalculations
   * @param state - Current pattern state
   * @param sectionName - Section to check
   * @returns Boolean indicating if recalculations are needed
   */
  public hasPendingRecalculations(state: PatternState, sectionName: string): boolean {
    switch (sectionName) {
      case 'bodyStructure':
        return !!state.bodyStructure.armholeRequiresRecalculation;
      default:
        return false;
    }
  }

  /**
   * Clear recalculation flags for a section (to be called after pattern generation)
   * @param state - Current pattern state
   * @param sectionName - Section to clear flags for
   * @returns Updated pattern state
   */
  public clearRecalculationFlags(state: PatternState, sectionName: string): PatternState {
    switch (sectionName) {
      case 'bodyStructure':
        return {
          ...state,
          bodyStructure: {
            ...state.bodyStructure,
            armholeRequiresRecalculation: false
          }
        };
      default:
        return state;
    }
  }

  /**
   * Get summary of all pending recalculations
   * @param state - Current pattern state
   * @returns Array of sections with pending recalculations
   */
  public getPendingRecalculationSummary(state: PatternState): string[] {
    const pending: string[] = [];
    
    if (state.bodyStructure.armholeRequiresRecalculation) {
      pending.push('bodyStructure.armhole');
    }

    return pending;
  }
}

/**
 * Singleton instance factory
 */
let dependencyServiceInstance: PatternDependencyService | null = null;

export function getPatternDependencyService(loggingService: LoggingService): PatternDependencyService {
  if (!dependencyServiceInstance) {
    dependencyServiceInstance = new PatternDependencyService(loggingService);
  }
  return dependencyServiceInstance;
} 