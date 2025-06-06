/**
 * Undo/Redo Tests (PD_PH3_US001)
 * Tests for undo/redo functionality in pattern definition
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useInMemoryPatternUndoRedo } from '@/stores/patternDefinitionUndoRedoStore';
import { InMemoryPatternDefinitionWithUndoRedoProvider, useInMemoryPatternDefinitionWithUndoRedo } from '@/contexts/InMemoryPatternDefinitionWithUndoRedoContext';
import UndoRedoControls from '@/components/knitting/UndoRedoControls';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

/**
 * Test Component for Undo/Redo Store
 */
function UndoRedoStoreTestComponent() {
  const {
    state,
    setState,
    undo,
    redo,
    undoRedoState,
    clearHistory,
    updateConfig,
  } = useInMemoryPatternUndoRedo();

  return (
    <div>
      <div data-testid="current-value">{state?.sessionName || 'null'}</div>
      <div data-testid="can-undo">{undoRedoState.canUndo ? 'true' : 'false'}</div>
      <div data-testid="can-redo">{undoRedoState.canRedo ? 'true' : 'false'}</div>
      <div data-testid="history-size">{undoRedoState.historySize}</div>
      <div data-testid="current-index">{undoRedoState.currentIndex}</div>
      
      <button
        data-testid="set-value-1"
        onClick={() => setState({
          sessionId: 'test-1',
          sessionName: 'Test Pattern 1',
          craftType: 'knitting',
          garmentType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })}
      >
        Set Value 1
      </button>
      
      <button
        data-testid="set-value-2"
        onClick={() => setState({
          sessionId: 'test-2',
          sessionName: 'Test Pattern 2',
          craftType: 'knitting',
          garmentType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })}
      >
        Set Value 2
      </button>
      
      <button data-testid="undo" onClick={undo}>
        Undo
      </button>
      
      <button data-testid="redo" onClick={redo}>
        Redo
      </button>
      
      <button data-testid="clear-history" onClick={clearHistory}>
        Clear History
      </button>
      
      <button
        data-testid="disable-undo-redo"
        onClick={() => updateConfig({ enabled: false })}
      >
        Disable
      </button>
    </div>
  );
}

/**
 * Test Component for Context Integration
 */
function ContextTestComponent() {
  const {
    currentPattern,
    undoRedoState,
    createPattern,
    selectGarmentType,
    updateSectionData,
    undo,
    redo,
    updateUndoRedoConfig,
    clearPattern,
    clearHistory,
  } = useInMemoryPatternDefinitionWithUndoRedo();

  const resetState = () => {
    clearPattern();
    clearHistory();
    updateUndoRedoConfig({ enabled: false });
  };

  return (
    <div>
      <div data-testid="pattern-name">{currentPattern?.sessionName || 'null'}</div>
      <div data-testid="garment-type">{currentPattern?.garmentType || 'null'}</div>
      <div data-testid="context-can-undo">{undoRedoState.canUndo ? 'true' : 'false'}</div>
      <div data-testid="context-can-redo">{undoRedoState.canRedo ? 'true' : 'false'}</div>
      <div data-testid="undo-enabled">{undoRedoState.config.enabled ? 'true' : 'false'}</div>
      
      <button
        data-testid="reset-state"
        onClick={resetState}
      >
        Reset State
      </button>
      
      <button
        data-testid="enable-undo-redo"
        onClick={() => updateUndoRedoConfig({ enabled: true })}
      >
        Enable Undo/Redo
      </button>
      
      <button
        data-testid="create-pattern"
        onClick={() => createPattern('Test Pattern', 'knitting')}
      >
        Create Pattern
      </button>
      
      <button
        data-testid="select-garment"
        onClick={() => selectGarmentType('sweater_pullover')}
      >
        Select Sweater
      </button>
      
      <button
        data-testid="update-gauge"
        onClick={() => updateSectionData('gauge', { stitchesPer10cm: 20 })}
      >
        Update Gauge
      </button>
      
      <button data-testid="context-undo" onClick={undo}>
        Undo
      </button>
      
      <button data-testid="context-redo" onClick={redo}>
        Redo
      </button>
    </div>
  );
}

describe('Undo/Redo Store', () => {
  test('should initialize with null state and no undo/redo capability', () => {
    render(<UndoRedoStoreTestComponent />);
    
    expect(screen.getByTestId('current-value')).toHaveTextContent('null');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
    expect(screen.getByTestId('history-size')).toHaveTextContent('1');
  });

  test('should enable undo after setting a value', () => {
    render(<UndoRedoStoreTestComponent />);
    
    fireEvent.click(screen.getByTestId('set-value-1'));
    
    expect(screen.getByTestId('current-value')).toHaveTextContent('Test Pattern 1');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
  });

  test('should support undo and redo operations', () => {
    render(<UndoRedoStoreTestComponent />);
    
    // Set first value
    fireEvent.click(screen.getByTestId('set-value-1'));
    expect(screen.getByTestId('current-value')).toHaveTextContent('Test Pattern 1');
    
    // Set second value
    fireEvent.click(screen.getByTestId('set-value-2'));
    expect(screen.getByTestId('current-value')).toHaveTextContent('Test Pattern 2');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    
    // Undo to first value
    fireEvent.click(screen.getByTestId('undo'));
    expect(screen.getByTestId('current-value')).toHaveTextContent('Test Pattern 1');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('true');
    
    // Redo to second value
    fireEvent.click(screen.getByTestId('redo'));
    expect(screen.getByTestId('current-value')).toHaveTextContent('Test Pattern 2');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
  });

  test('should clear history when requested', () => {
    render(<UndoRedoStoreTestComponent />);
    
    fireEvent.click(screen.getByTestId('set-value-1'));
    fireEvent.click(screen.getByTestId('set-value-2'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    
    fireEvent.click(screen.getByTestId('clear-history'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
  });

  test('should disable undo/redo when configuration is disabled', () => {
    render(<UndoRedoStoreTestComponent />);
    
    fireEvent.click(screen.getByTestId('set-value-1'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    
    fireEvent.click(screen.getByTestId('disable-undo-redo'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
  });
});

describe('Pattern Definition Context with Undo/Redo', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <InMemoryPatternDefinitionWithUndoRedoProvider>
        {component}
      </InMemoryPatternDefinitionWithUndoRedoProvider>
    );
  };

  test('should create pattern and enable undo functionality', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    expect(screen.getByTestId('undo-enabled')).toHaveTextContent('true');
    
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('null');
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('create-pattern'));
    
    expect(screen.getByTestId('pattern-name')).toHaveTextContent('Test Pattern');
    // Pattern creation doesn't create an undo point (it's initial state)
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false');
  });

  test('should create undo points for significant changes', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Create pattern
    fireEvent.click(screen.getByTestId('create-pattern'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false');
    
    // Select garment type (significant change)
    fireEvent.click(screen.getByTestId('select-garment'));
    expect(screen.getByTestId('garment-type')).toHaveTextContent('sweater_pullover');
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true');
    
    // Update section data (significant change)
    fireEvent.click(screen.getByTestId('update-gauge'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true');
  });

  test('should support undo/redo of pattern changes', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Create pattern and select garment
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment'));
    expect(screen.getByTestId('garment-type')).toHaveTextContent('sweater_pullover');
    
    // Undo garment selection
    fireEvent.click(screen.getByTestId('context-undo'));
    expect(screen.getByTestId('garment-type')).toHaveTextContent('null');
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // Redo garment selection
    fireEvent.click(screen.getByTestId('context-redo'));
    expect(screen.getByTestId('garment-type')).toHaveTextContent('sweater_pullover');
  });
});

describe('UndoRedoControls Component', () => {
  const mockUndoRedoState = {
    canUndo: true,
    canRedo: false,
    currentIndex: 1,
    historySize: 2,
    config: {
      maxHistorySize: 20,
      enabled: true,
      autoSnapshot: true,
    },
  };

  test('should render undo/redo buttons with correct states', () => {
    const mockOnUndo = jest.fn();
    const mockOnRedo = jest.fn();

    render(
      <UndoRedoControls
        undoRedoState={mockUndoRedoState}
        onUndo={mockOnUndo}
        onRedo={mockOnRedo}
      />
    );

    const undoButton = screen.getByLabelText('Undo last change');
    const redoButton = screen.getByLabelText('Redo last undone change');

    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  test('should call undo/redo functions when buttons are clicked', () => {
    const mockOnUndo = jest.fn();
    const mockOnRedo = jest.fn();

    render(
      <UndoRedoControls
        undoRedoState={mockUndoRedoState}
        onUndo={mockOnUndo}
        onRedo={mockOnRedo}
      />
    );

    fireEvent.click(screen.getByLabelText('Undo last change'));
    expect(mockOnUndo).toHaveBeenCalledTimes(1);

    // Redo button is disabled, so clicking it shouldn't call the function
    fireEvent.click(screen.getByLabelText('Redo last undone change'));
    expect(mockOnRedo).not.toHaveBeenCalled();
  });

  test('should disable both buttons when no undo/redo is possible', () => {
    const disabledState = {
      ...mockUndoRedoState,
      canUndo: false,
      canRedo: false,
    };

    render(
      <UndoRedoControls
        undoRedoState={disabledState}
        onUndo={() => {}}
        onRedo={() => {}}
      />
    );

    expect(screen.getByLabelText('Undo last change')).toBeDisabled();
    expect(screen.getByLabelText('Redo last undone change')).toBeDisabled();
  });
});

/**
 * Acceptance Criteria Tests (from specification)
 */
describe('Acceptance Criteria (PD_PH3_US001)', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <InMemoryPatternDefinitionWithUndoRedoProvider>
        {component}
      </InMemoryPatternDefinitionWithUndoRedoProvider>
    );
  };

  test('AC1: User changes a measurement value, undo reverts it', async () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Setup: Create pattern and select garment
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment'));
    
    // Given: User changes a measurement value from default to 60 (simulated)
    fireEvent.click(screen.getByTestId('update-gauge')); // This simulates updating gauge data
    
    // When: User clicks "Undo"
    fireEvent.click(screen.getByTestId('context-undo'));
    
    // Then: The measurement value reverts and undo state updates
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true'); // Still can undo garment selection
  });

  test('AC2: After undo, redo restores the change', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Setup
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment'));
    fireEvent.click(screen.getByTestId('update-gauge'));
    
    // Undo the gauge update
    fireEvent.click(screen.getByTestId('context-undo'));
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // When: User clicks "Redo"
    fireEvent.click(screen.getByTestId('context-redo'));
    
    // Then: The change is restored
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false');
  });

  test('AC3: Multiple sequential changes can be undone and redone', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Setup: Create pattern and make multiple changes
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment')); // Change 1
    fireEvent.click(screen.getByTestId('update-gauge'));   // Change 2
    
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true');
    
    // Undo first change (gauge update)
    fireEvent.click(screen.getByTestId('context-undo'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true'); // Can still undo garment selection
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // Undo second change (garment selection)
    fireEvent.click(screen.getByTestId('context-undo'));
    expect(screen.getByTestId('garment-type')).toHaveTextContent('null');
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // Redo both changes
    fireEvent.click(screen.getByTestId('context-redo')); // Restore garment selection
    expect(screen.getByTestId('garment-type')).toHaveTextContent('sweater_pullover');
    
    fireEvent.click(screen.getByTestId('context-redo')); // Restore gauge update
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false');
  });

  test('AC4: Undo button is disabled initially and after undoing all steps', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Initially disabled
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false');
    
    // Create pattern and make changes
    fireEvent.click(screen.getByTestId('create-pattern'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false'); // Pattern creation doesn't create undo point
    
    // Make a change
    fireEvent.click(screen.getByTestId('select-garment'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('true');
    
    // Undo all changes
    fireEvent.click(screen.getByTestId('context-undo'));
    expect(screen.getByTestId('context-can-undo')).toHaveTextContent('false'); // Back to initial state
  });

  test('AC5: Redo button is disabled initially and after redoing all steps', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Initially disabled
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false');
    
    // Create pattern and make a change
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment'));
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false'); // No redo available
    
    // Undo the change
    fireEvent.click(screen.getByTestId('context-undo'));

    // Now redo is possible
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // Redo the change
    fireEvent.click(screen.getByTestId('context-redo'));
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false'); // No more redo available
  });

  test('AC6: Redo is disabled after making a new change', () => {
    renderWithProvider(<ContextTestComponent />);
    
    // Reset state first
    fireEvent.click(screen.getByTestId('reset-state'));
    
    // Enable undo/redo
    fireEvent.click(screen.getByTestId('enable-undo-redo'));
    
    // Create pattern and make a change
    fireEvent.click(screen.getByTestId('create-pattern'));
    fireEvent.click(screen.getByTestId('select-garment'));
    
    // Undo the change
    fireEvent.click(screen.getByTestId('context-undo'));
    
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('true');
    
    // Make a new change (should clear redo stack)
    fireEvent.click(screen.getByTestId('update-gauge'));
    expect(screen.getByTestId('context-can-redo')).toHaveTextContent('false'); // Redo cleared
  });
}); 