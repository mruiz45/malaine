import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reverse Gauge Calculator | Malaine',
  description: 'Calculate required stitches/rows for target dimensions, resulting dimensions from stitch counts, or compare pattern gauge vs user gauge',
};

export default function ReverseGaugeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 