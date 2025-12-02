import { Coffee, Music, Phone, Wind } from 'lucide-react';

interface RecommendationsProps {
  stressLevel: number;
}

export function Recommendations({ stressLevel }: RecommendationsProps) {
  const getRecommendations = () => {
    if (stressLevel > 70) {
      return [
        { icon: <Phone className="w-5 h-5" />, text: "Contact Counselor Immediately", color: "bg-red-100 text-red-600" },
        { icon: <Wind className="w-5 h-5" />, text: "Deep Breathing (4-7-8)", color: "bg-orange-100 text-orange-600" }
      ];
    } else if (stressLevel > 30) {
      return [
        { icon: <Music className="w-5 h-5" />, text: "Listen to Calming Music", color: "bg-indigo-100 text-indigo-600" },
        { icon: <Coffee className="w-5 h-5" />, text: "Take a 15-min Break", color: "bg-amber-100 text-amber-600" }
      ];
    }
    return [
      { icon: <Wind className="w-5 h-5" />, text: "Maintain Routine", color: "bg-green-100 text-green-600" },
      { icon: <Coffee className="w-5 h-5" />, text: "Stay Hydrated", color: "bg-blue-100 text-blue-600" }
    ];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
      <div className="space-y-3">
        {getRecommendations().map((rec, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${rec.color}`}>
              {rec.icon}
            </div>
            <span className="text-gray-700 text-sm font-medium">{rec.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}