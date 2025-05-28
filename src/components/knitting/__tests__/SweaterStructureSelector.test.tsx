/**
 * Tests for SweaterStructureSelector Component (US_4.3)
 * Validates the acceptance criteria defined in the user story
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SweaterStructureSelector from '../SweaterStructureSelector';
import { ConstructionMethod, BodyShape } from '@/types/sweaterStructure';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('SweaterStructureSelector', () => {
  const mockOnConstructionMethodSelect = jest.fn();
  const mockOnBodyShapeSelect = jest.fn();

  const defaultProps = {
    selectedGarmentTypeId: 'sweater-id',
    onConstructionMethodSelect: mockOnConstructionMethodSelect,
    onBodyShapeSelect: mockOnBodyShapeSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * AC1: If "Sweater" is selected, the tool for construction method and body shape is displayed
   */
  test('displays construction method and body shape selectors when garment type is selected', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    expect(screen.getByText('Construction Method')).toBeInTheDocument();
    expect(screen.getByText('Body Shape')).toBeInTheDocument();
  });

  /**
   * AC2: The user can select "Drop Shoulder" as construction and "Straight" as body shape
   */
  test('allows selection of Drop Shoulder construction method', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    const dropShoulderOption = screen.getByText('Drop Shoulder');
    expect(dropShoulderOption).toBeInTheDocument();
    
    fireEvent.click(dropShoulderOption.closest('div')!);
    expect(mockOnConstructionMethodSelect).toHaveBeenCalledWith('drop_shoulder');
  });

  test('allows selection of Straight body shape', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    const straightOption = screen.getByText('Straight');
    expect(straightOption).toBeInTheDocument();
    
    fireEvent.click(straightOption.closest('div')!);
    expect(mockOnBodyShapeSelect).toHaveBeenCalledWith('straight');
  });

  /**
   * AC3: These selections are correctly saved (handled by parent component)
   */
  test('calls callback functions when selections are made', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    // Test construction method callback
    const raglanOption = screen.getByText('Raglan');
    fireEvent.click(raglanOption.closest('div')!);
    expect(mockOnConstructionMethodSelect).toHaveBeenCalledWith('raglan');

    // Test body shape callback
    const aLineOption = screen.getByText('A-line');
    fireEvent.click(aLineOption.closest('div')!);
    expect(mockOnBodyShapeSelect).toHaveBeenCalledWith('a_line');
  });

  /**
   * AC4: Illustrative icons/diagrams and descriptions are present for each option
   */
  test('displays descriptions for construction methods', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    expect(screen.getByText(/Simple construction with no shoulder shaping/)).toBeInTheDocument();
    expect(screen.getByText(/Traditional construction with shaped armholes/)).toBeInTheDocument();
    expect(screen.getByText(/Diagonal seams from neck to underarm/)).toBeInTheDocument();
    expect(screen.getByText(/Wide, loose sleeves that are part of the body piece/)).toBeInTheDocument();
  });

  test('displays descriptions for body shapes', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    expect(screen.getByText(/Classic straight silhouette with minimal shaping/)).toBeInTheDocument();
    expect(screen.getByText(/Fitted at the bust with gradual widening/)).toBeInTheDocument();
    expect(screen.getByText(/Tailored fit with waist shaping/)).toBeInTheDocument();
    expect(screen.getByText(/Relaxed, boxy fit with extra ease/)).toBeInTheDocument();
  });

  test('displays difficulty badges for construction methods', () => {
    render(<SweaterStructureSelector {...defaultProps} />);
    
    expect(screen.getByText('beginner')).toBeInTheDocument(); // Drop Shoulder
    expect(screen.getAllByText('intermediate')).toHaveLength(2); // Set-in Sleeve, Raglan
    expect(screen.getByText('advanced')).toBeInTheDocument(); // Dolman
  });

  /**
   * AC5: If a garment type like "Scarf" is selected, this specific tool is not displayed
   * (This is handled by the parent component PatternDefinitionWorkspace)
   */

  /**
   * Test selected states
   */
  test('shows selected state for construction method', () => {
    render(
      <SweaterStructureSelector 
        {...defaultProps} 
        selectedConstructionMethod="set_in_sleeve"
      />
    );
    
    const setInSleeveOption = screen.getByText('Set-in Sleeve').closest('div')!.parentElement!;
    expect(setInSleeveOption.className).toContain('border-emerald-500');
  });

  test('shows selected state for body shape', () => {
    render(
      <SweaterStructureSelector 
        {...defaultProps} 
        selectedBodyShape="fitted_shaped_waist"
      />
    );
    
    const fittedOption = screen.getByText('Fitted/Shaped Waist').closest('div')!.parentElement!;
    expect(fittedOption.className).toContain('border-emerald-500');
  });

  /**
   * Test compatibility filtering
   */
  test('filters body shapes based on selected construction method', () => {
    const { rerender } = render(
      <SweaterStructureSelector 
        {...defaultProps} 
        selectedConstructionMethod="set_in_sleeve"
      />
    );
    
    // All body shapes should be available for set-in sleeve
    expect(screen.getByText('Straight')).toBeInTheDocument();
    expect(screen.getByText('A-line')).toBeInTheDocument();
    expect(screen.getByText('Fitted/Shaped Waist')).toBeInTheDocument();
    expect(screen.queryByText('Oversized Boxy')).not.toBeInTheDocument(); // Not compatible with set-in sleeve

    // Rerender with dolman construction
    rerender(
      <SweaterStructureSelector 
        {...defaultProps} 
        selectedConstructionMethod="dolman"
      />
    );
    
    // Only compatible shapes should be available for dolman (straight and oversized_boxy)
    expect(screen.getByText('Straight')).toBeInTheDocument();
    expect(screen.getByText('Oversized Boxy')).toBeInTheDocument();
    
    // Incompatible shapes should not be rendered at all
    expect(screen.queryByText('A-line')).not.toBeInTheDocument();
    expect(screen.queryByText('Fitted/Shaped Waist')).not.toBeInTheDocument();
  });

  /**
   * Test loading state
   */
  test('displays loading state', () => {
    render(<SweaterStructureSelector {...defaultProps} isLoading={true} />);
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  /**
   * Test disabled state
   */
  test('respects disabled prop', () => {
    render(<SweaterStructureSelector {...defaultProps} disabled={true} />);
    
    const dropShoulderOption = screen.getByText('Drop Shoulder').closest('div')!;
    fireEvent.click(dropShoulderOption);
    
    expect(mockOnConstructionMethodSelect).not.toHaveBeenCalled();
  });
}); 