import { FileText } from 'lucide-react';

interface DataLogProps {
  history: any[];
}

export function DataLog({ history }: DataLogProps) {
  if (!history || history.length === 0) {
    return <div className="p-8 text-center text-gray-500">No data records found.</div>;
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-700">Full Dataset Log ({history.length} Days)</h3>
      </div>
      
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-3">Day</th>
              <th className="px-6 py-3">Stress %</th>
              <th className="px-6 py-3">Study (Hrs)</th>
              <th className="px-6 py-3">Sleep (Hrs)</th>
              <th className="px-6 py-3">Screen (Hrs)</th>
              <th className="px-6 py-3">Activity (Hrs)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{row.day}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.stressScore > 70 ? 'bg-red-100 text-red-700' :
                    row.stressScore > 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {row.stressScore}%
                  </span>
                </td>
                <td className="px-6 py-4">{row.studyHours}</td>
                <td className="px-6 py-4">{row.sleepHours}</td>
                <td className="px-6 py-4">{row.screenTime}</td>
                <td className="px-6 py-4">{row.physicalActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}