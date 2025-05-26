import { Metadata } from 'next';
import YarnQuantityEstimator from '@/components/tools/YarnQuantityEstimator';

export const metadata: Metadata = {
  title: 'Yarn Quantity Estimator | Malaine',
  description: 'Estimate the amount of yarn needed for your knitting or crochet project based on gauge, yarn specifications, and project type.',
  keywords: ['yarn calculator', 'knitting calculator', 'crochet calculator', 'yarn estimation', 'project planning'],
};

/**
 * Yarn Quantity Estimator Tool Page (US_2.2)
 * Provides a tool to estimate yarn requirements for knitting/crochet projects
 */
export default function YarnQuantityEstimatorPage() {
  return <YarnQuantityEstimator />;
} 