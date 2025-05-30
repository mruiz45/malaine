import { Metadata } from 'next';
import { generateCustomMetadata } from '@/utils/metadata';
import YarnQuantityEstimator from '@/components/tools/YarnQuantityEstimator';

export const metadata: Metadata = generateCustomMetadata(
  'Yarn Quantity Estimator | Malaine',
  'Estimate the amount of yarn needed for your knitting or crochet project based on gauge, yarn specifications, and project type.',
  ['yarn calculator', 'knitting calculator', 'crochet calculator', 'yarn estimation', 'project planning']
);

/**
 * Yarn Quantity Estimator Tool Page (US_2.2)
 * Provides a tool to estimate yarn requirements for knitting/crochet projects
 */
export default function YarnQuantityEstimatorPage() {
  return <YarnQuantityEstimator />;
} 