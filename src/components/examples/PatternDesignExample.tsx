'use client';

import { useState, useCallback, useEffect } from 'react';
import { getLoggingService } from '@/services/LoggingService';

/**
 * Example component demonstrating pattern design logging integration
 * This component shows how to integrate the logging system in pattern design components
 */
export function PatternDesignExample() {
  const [garmentType, setGarmentType] = useState<string>('');
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    bodyLength: '',
  });
  const [necklineType, setNecklineType] = useState<string>('round');
  const [history, setHistory] = useState<any[]>([]);
  const [restorePoints, setRestorePoints] = useState<string[]>([]);

  // Get logging service instance
  const loggingService = getLoggingService();
  const componentName = 'PatternDesignExample';

  // Log component initialization
  useEffect(() => {
    loggingService.logComponentInitialized(componentName);
  }, [loggingService, componentName]);

  // Handle garment type selection
  const handleGarmentTypeChange = useCallback((newType: string) => {
    const previousType = garmentType;
    setGarmentType(newType);
    
    // Log the garment type selection
    loggingService.logGarmentTypeSelected(newType, previousType, componentName);
    
    // Log state mutation
    loggingService.logStateMutation(
      'Garment type updated',
      { garmentType: previousType },
      { garmentType: newType },
      componentName
    );
  }, [garmentType, loggingService, componentName]);

  // Handle measurement updates
  const handleMeasurementChange = useCallback((field: string, value: string) => {
    const oldValue = measurements[field as keyof typeof measurements];
    
    setMeasurements(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Log measurement update
    loggingService.logMeasurementUpdated(field, oldValue, value, 'cm', componentName);
  }, [measurements, loggingService, componentName]);

  // Handle neckline type change
  const handleNecklineChange = useCallback((newType: string) => {
    const oldType = necklineType;
    setNecklineType(newType);
    
    // Log neckline type change
    loggingService.logNecklineTypeChanged(oldType, newType, componentName);
  }, [necklineType, loggingService, componentName]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      // Simulate undo logic
      const lastState = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      
      // Log undo action
      loggingService.logUndoTriggered(componentName);
      
      console.log('Undo performed:', lastState);
    }
  }, [history, loggingService, componentName]);

  // Handle creating restore point
  const handleCreateRestorePoint = useCallback(() => {
    const restorePointName = `RP${restorePoints.length + 1}`;
    setRestorePoints(prev => [...prev, restorePointName]);
    
    // Log restore point creation
    loggingService.logRestorePointCreated(
      restorePointName,
      `Restore point created at ${new Date().toLocaleTimeString()}`,
      componentName
    );
  }, [restorePoints, loggingService, componentName]);

  // Simulate pattern calculation
  const handleCalculatePattern = useCallback(async () => {
    try {
      // Log calculation start
      loggingService.log('INFO', 'PATTERN_CALCULATION_STARTED', {
        calculationType: 'basic_sweater',
        garmentType,
        measurements,
      }, componentName);

      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate potential validation error
      if (!garmentType) {
        const error = 'Garment type must be selected before calculation';
        loggingService.log('WARN', 'VALIDATION_ERROR', {
          field: 'garmentType',
          error,
          value: garmentType,
        }, componentName);
        throw new Error(error);
      }

      // Log successful calculation
      loggingService.log('INFO', 'PATTERN_CALCULATION_COMPLETED', {
        calculationType: 'basic_sweater',
        duration: 1000,
      }, componentName);

      console.log('Pattern calculation completed successfully');

    } catch (error) {
      // Log calculation error
      loggingService.log('ERROR', 'PATTERN_CALCULATION_ERROR', {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        calculationType: 'basic_sweater',
      }, componentName);

      console.error('Pattern calculation failed:', error);
    }
  }, [garmentType, measurements, loggingService, componentName]);

  // Handle errors with logging
  const handleError = useCallback((error: Error, context: string) => {
    loggingService.logError(error, context, componentName);
  }, [loggingService, componentName]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Pattern Design Example with Logging
        </h1>
        
        {/* Garment Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Garment Type
          </label>
          <select
            value={garmentType}
            onChange={(e) => handleGarmentTypeChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select garment type...</option>
            <option value="sweater">Sweater</option>
            <option value="cardigan">Cardigan</option>
            <option value="vest">Vest</option>
          </select>
        </div>

        {/* Measurements */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Measurements (cm)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(measurements).map(([field, value]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Neckline Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Neckline Type
          </label>
          <select
            value={necklineType}
            onChange={(e) => handleNecklineChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="round">Round</option>
            <option value="v-neck">V-neck</option>
            <option value="crew">Crew</option>
            <option value="boat">Boat</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleCalculatePattern}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Calculate Pattern
          </button>
          
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          
          <button
            onClick={handleCreateRestorePoint}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Restore Point
          </button>
          
          <button
            onClick={() => handleError(new Error('Test error'), 'User clicked error button')}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Test Error Logging
          </button>
        </div>

        {/* Status Display */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current State</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Garment Type:</strong> {garmentType || 'Not selected'}</p>
            <p><strong>Neckline:</strong> {necklineType}</p>
            <p><strong>History Items:</strong> {history.length}</p>
            <p><strong>Restore Points:</strong> {restorePoints.length}</p>
            <p><strong>Session ID:</strong> {loggingService.getSessionId()}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Logging Test Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select a garment type to log garment type selection</li>
            <li>Change measurements to log measurement updates</li>
            <li>Change neckline type to log neckline changes</li>
            <li>Click "Calculate Pattern" to log calculation events</li>
            <li>Click "Create Restore Point" to log restore point creation</li>
            <li>Click "Test Error Logging" to log error events</li>
            <li>Check the console and the <code>logs/pattern-design.log</code> file for logged events</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 