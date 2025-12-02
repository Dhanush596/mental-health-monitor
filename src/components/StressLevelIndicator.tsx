interface StressLevelIndicatorProps {
  stressLevel: number;
}

export function StressLevelIndicator({ stressLevel }: StressLevelIndicatorProps) {
  const getStressColor = (level: number) => {
    if (level < 30) return 'text-green-500';
    if (level < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = (level: number) => {
    if (level < 30) return 'Low Stress';
    if (level < 70) return 'Moderate Stress';
    return 'High Stress';
  };

  // Math to draw the circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stressLevel / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r={radius} stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
          <circle
            cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${getStressColor(stressLevel)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getStressColor(stressLevel)}`}>{stressLevel}%</span>
          <span className="text-sm text-gray-500 font-medium mt-1">{getStatusText(stressLevel)}</span>
        </div>
      </div>
    </div>
  );
}