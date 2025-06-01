/**
 * Tests for Garment Assembly Viewer Component (US_12.9)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GarmentAssemblyViewer from '../GarmentAssemblyViewer';

// Mock the useAssemblyVisualization hook
jest.mock('@/hooks/useAssemblyVisualization', () => ({
  useAssemblyVisualization: jest.fn(() => ({
    assemblyData: null,
    isLoading: true,
    error: null,
    state: {
      assembly_data: null,
      is_loading: true,
      error: null,
      drag_mode_enabled: false,
      zoom_level: 1.0,
      pan_offset: { x: 0, y: 0 }
    },
    selectComponent: jest.fn(),
    highlightConnection: jest.fn(),
    updateComponentPosition: jest.fn(),
    toggleDragMode: jest.fn(),
    setZoomLevel: jest.fn(),
    resetView: jest.fn(),
    autoArrangeComponents: jest.fn(),
    validationResult: { isValid: true, errors: [] }
  }))
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('GarmentAssemblyViewer', () => {
  const defaultProps = {
    session_id: 'test-session-123'
  };

  it('renders loading state correctly', () => {
    render(<GarmentAssemblyViewer {...defaultProps} />);
    
    expect(screen.getByText(/Loading assembly visualization/i)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(<GarmentAssemblyViewer {...defaultProps} />);
    
    // Component should render without throwing
    expect(screen.getByText(/Loading assembly visualization/i)).toBeInTheDocument();
  });

  it('applies print mode correctly', () => {
    render(<GarmentAssemblyViewer {...defaultProps} print_mode={true} />);
    
    // Should still render loading state even in print mode
    expect(screen.getByText(/Loading assembly visualization/i)).toBeInTheDocument();
  });
}); 