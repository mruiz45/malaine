/**
 * Types for Colorwork Assignments (US_12.7)
 * Defines interfaces for managing color assignments between stitch patterns and yarn profiles
 */

import type { YarnProfile } from './yarn';
import type { ColorDefinition } from './stitchChart';

/**
 * Assignment of a color key to a specific yarn profile
 */
export interface ColorAssignment {
  /** Color key from the pattern palette (e.g., "MC", "CC1") */
  color_key: string;
  /** Yarn profile ID assigned to this color */
  yarn_profile_id: string;
}

/**
 * Complete colorwork assignments for a specific stitch pattern
 */
export interface StitchPatternColorAssignments {
  /** Stitch pattern ID these assignments apply to */
  stitch_pattern_id: string;
  /** Individual color assignments */
  assignments: ColorAssignment[];
  /** Timestamp when assignments were last updated */
  updated_at: string;
}

/**
 * Colorwork assignments data as stored in pattern_definition_session.parameter_snapshot
 */
export interface ColorworkAssignmentsSnapshot {
  /** Assignments organized by stitch pattern ID */
  [stitch_pattern_id: string]: {
    /** Color key to yarn profile ID mappings */
    [color_key: string]: string;
  };
}

/**
 * Resolved color information combining pattern palette with user assignments
 */
export interface ResolvedColorInfo {
  /** Color key from the pattern */
  color_key: string;
  /** Color name from the pattern palette */
  color_name: string;
  /** Final hex color code to use */
  hex_code: string;
  /** Source of the color information */
  source: 'yarn_profile' | 'default_palette';
  /** Yarn profile information if assigned */
  yarn_profile?: {
    id: string;
    yarn_name: string;
    color_name?: string;
  };
}

/**
 * Request data for updating colorwork assignments
 */
export interface UpdateColorworkAssignmentsRequest {
  /** Session ID to update */
  session_id: string;
  /** Stitch pattern ID */
  stitch_pattern_id: string;
  /** New assignments */
  assignments: ColorAssignment[];
}

/**
 * Response data for colorwork assignments operations
 */
export interface ColorworkAssignmentsResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Updated assignments data */
  data?: StitchPatternColorAssignments;
  /** Error message if failed */
  error?: string;
}

/**
 * Props for colorwork assignment UI components
 */
export interface ColorworkAssignmentProps {
  /** Available yarn profiles for assignment */
  availableYarnProfiles: YarnProfile[];
  /** Pattern color palette definitions */
  colorPalette: ColorDefinition[];
  /** Current assignments */
  currentAssignments?: ColorAssignment[];
  /** Callback when assignments change */
  onAssignmentsChange: (assignments: ColorAssignment[]) => void;
  /** Whether the component is in read-only mode */
  readOnly?: boolean;
}

/**
 * State for colorwork assignment management
 */
export interface ColorworkAssignmentState {
  /** Current assignments being edited */
  assignments: ColorAssignment[];
  /** Whether changes have been made */
  hasChanges: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
} 