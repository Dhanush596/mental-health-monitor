import { AlertCircle } from 'lucide-react';

interface AlertSystemProps {
  stressLevel: number;
}

export function AlertSystem({ stressLevel }: AlertSystemProps) {
  if (stressLevel < 70) return null; // Don't show anything if stress is low

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse mt-4">
      <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-red-800">High Stress Detected</h3>
        <p className="text-sm text-red-600 mt-1">
          Threshold exceeded. Automated alert sent to counselor.
        </p>
      </div>
    </div>
  );
}