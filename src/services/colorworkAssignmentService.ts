/**
 * Colorwork Assignment Service (US_12.7)
 * Manages color assignments between stitch pattern color keys and yarn profiles
 * Follows the established service pattern for the Malaine project
 */

import type {
  ColorAssignment,
  StitchPatternColorAssignments,
  ColorworkAssignmentsSnapshot,
  ResolvedColorInfo,
  UpdateColorworkAssignmentsRequest,
  ColorworkAssignmentsResponse
} from '@/types/colorworkAssignments';
import type { ColorDefinition } from '@/types/stitchChart';
import type { YarnProfile } from '@/types/yarn';

/**
 * Get colorwork assignments for a specific stitch pattern from a session
 * @param sessionId - Pattern definition session ID
 * @param stitchPatternId - Stitch pattern ID
 * @returns Promise<ColorAssignment[]> Current assignments for the pattern
 */
export async function getColorworkAssignments(
  sessionId: string,
  stitchPatternId: string
): Promise<ColorAssignment[]> {
  try {
    const response = await fetch(`/api/pattern-definition-sessions/${sessionId}/colorwork-assignments/${stitchPatternId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No assignments yet
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ColorworkAssignmentsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch colorwork assignments');
    }

    return result.data?.assignments || [];
  } catch (error) {
    console.error('Error fetching colorwork assignments:', error);
    throw error;
  }
}

/**
 * Update colorwork assignments for a specific stitch pattern in a session
 * @param sessionId - Pattern definition session ID
 * @param stitchPatternId - Stitch pattern ID
 * @param assignments - New color assignments
 * @returns Promise<StitchPatternColorAssignments> Updated assignments data
 */
export async function updateColorworkAssignments(
  sessionId: string,
  stitchPatternId: string,
  assignments: ColorAssignment[]
): Promise<StitchPatternColorAssignments> {
  try {
    const requestData: UpdateColorworkAssignmentsRequest = {
      session_id: sessionId,
      stitch_pattern_id: stitchPatternId,
      assignments
    };

    const response = await fetch(`/api/pattern-definition-sessions/${sessionId}/colorwork-assignments/${stitchPatternId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ColorworkAssignmentsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update colorwork assignments');
    }

    if (!result.data) {
      throw new Error('No data returned from colorwork assignments update');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating colorwork assignments:', error);
    throw error;
  }
}

/**
 * Extract colorwork assignments from parameter snapshot
 * @param parameterSnapshot - Session parameter snapshot
 * @param stitchPatternId - Stitch pattern ID to extract assignments for
 * @returns ColorAssignment[] Extracted assignments
 */
export function extractColorworkAssignments(
  parameterSnapshot: Record<string, any> | undefined,
  stitchPatternId: string
): ColorAssignment[] {
  if (!parameterSnapshot?.colorwork_assignments) {
    return [];
  }

  const colorworkAssignments = parameterSnapshot.colorwork_assignments as ColorworkAssignmentsSnapshot;
  const patternAssignments = colorworkAssignments[stitchPatternId];

  if (!patternAssignments) {
    return [];
  }

  return Object.entries(patternAssignments).map(([colorKey, yarnProfileId]) => ({
    color_key: colorKey,
    yarn_profile_id: yarnProfileId
  }));
}

/**
 * Convert assignments array to snapshot format
 * @param assignments - Color assignments
 * @returns Record<string, string> Snapshot format assignments
 */
export function convertAssignmentsToSnapshot(
  assignments: ColorAssignment[]
): Record<string, string> {
  return assignments.reduce((acc, assignment) => {
    acc[assignment.color_key] = assignment.yarn_profile_id;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Resolve color information by combining pattern palette with user assignments
 * @param colorPalette - Pattern color palette definitions
 * @param assignments - User color assignments
 * @param availableYarnProfiles - Available yarn profiles for resolution
 * @returns Promise<ResolvedColorInfo[]> Resolved color information
 */
export async function resolveColorInformation(
  colorPalette: ColorDefinition[],
  assignments: ColorAssignment[],
  availableYarnProfiles: YarnProfile[]
): Promise<ResolvedColorInfo[]> {
  try {
    const resolved: ResolvedColorInfo[] = [];

    for (const colorDef of colorPalette) {
      // Find assignment for this color key
      const assignment = assignments.find(a => a.color_key === colorDef.key);

      if (assignment) {
        // Color is assigned to a yarn profile
        const yarnProfile = availableYarnProfiles.find(y => y.id === assignment.yarn_profile_id);

        if (yarnProfile && yarnProfile.color_hex_code) {
          resolved.push({
            color_key: colorDef.key,
            color_name: colorDef.name,
            hex_code: yarnProfile.color_hex_code,
            source: 'yarn_profile',
            yarn_profile: {
              id: yarnProfile.id,
              yarn_name: yarnProfile.yarn_name,
              color_name: yarnProfile.color_name
            }
          });
        } else {
          // Yarn profile not found or has no color, fall back to default
          resolved.push({
            color_key: colorDef.key,
            color_name: colorDef.name,
            hex_code: colorDef.default_hex,
            source: 'default_palette'
          });
        }
      } else {
        // No assignment, use default from palette
        resolved.push({
          color_key: colorDef.key,
          color_name: colorDef.name,
          hex_code: colorDef.default_hex,
          source: 'default_palette'
        });
      }
    }

    return resolved;
  } catch (error) {
    console.error('Error resolving color information:', error);
    throw error;
  }
}

/**
 * Validate colorwork assignments against pattern palette
 * @param assignments - Color assignments to validate
 * @param colorPalette - Pattern color palette
 * @param availableYarnProfiles - Available yarn profiles
 * @returns { isValid: boolean; errors: string[] } Validation result
 */
export function validateColorworkAssignments(
  assignments: ColorAssignment[],
  colorPalette: ColorDefinition[],
  availableYarnProfiles: YarnProfile[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check that all assigned color keys exist in the palette
  for (const assignment of assignments) {
    const colorExists = colorPalette.some(c => c.key === assignment.color_key);
    if (!colorExists) {
      errors.push(`Color key "${assignment.color_key}" is not defined in the pattern palette`);
    }

    // Check that assigned yarn profile exists and has a color
    const yarnProfile = availableYarnProfiles.find(y => y.id === assignment.yarn_profile_id);
    if (!yarnProfile) {
      errors.push(`Yarn profile "${assignment.yarn_profile_id}" not found`);
    } else if (!yarnProfile.color_hex_code) {
      errors.push(`Yarn profile "${yarnProfile.yarn_name}" does not have a color defined`);
    }
  }

  // Check for duplicate assignments (same color key assigned multiple times)
  const colorKeys = assignments.map(a => a.color_key);
  const duplicates = colorKeys.filter((key, index) => colorKeys.indexOf(key) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate assignments found for color keys: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 