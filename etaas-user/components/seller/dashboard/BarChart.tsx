import { View,Text } from "react-native";
import { TrendingUp } from "lucide-react-native";

interface ChartData {
  day: string;
  revenue: number;
}

export const SimpleBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const minRevenue = Math.min(...data.map((d) => d.revenue), 0);
  
  // Dynamically calculate nice Y-axis range
  const calculateYAxisRange = () => {
    if (maxRevenue === 0) {
      // No data case
      return {
        max: 1000,
        step: 250,
        labels: [0, 250, 500, 750, 1000]
      };
    }
    
    // Determine appropriate scale based on maxRevenue
    let scale: number;
    let divisions = 4; // Number of segments
    
    if (maxRevenue < 100) {
      scale = 10;
    } else if (maxRevenue < 500) {
      scale = 50;
    } else if (maxRevenue < 1000) {
      scale = 100;
    } else if (maxRevenue < 5000) {
      scale = 500;
    } else if (maxRevenue < 10000) {
      scale = 1000;
    } else if (maxRevenue < 50000) {
      scale = 5000;
    } else if (maxRevenue < 100000) {
      scale = 10000;
    } else {
      scale = 50000;
    }
    
    // Round up to next scale value
    const yAxisMax = Math.ceil(maxRevenue / scale) * scale;
    const yAxisStep = yAxisMax / divisions;
    
    // Generate labels
    const labels = Array.from({ length: divisions + 1 }, (_, i) => i * yAxisStep);
    
    return {
      max: yAxisMax,
      step: yAxisStep,
      labels: labels
    };
  };
  
  const { max: yAxisMax, step: yAxisStep, labels: yAxisLabels } = calculateYAxisRange();
  
  // Format currency for display
  const formatCurrency = (value: number): string => {
    if (value === 0) return '₱0';
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    return `₱${value}`;
  };
  
  const chartHeight = 160;
  
  return (
    <View className="bg-white rounded-3xl p-6 border border-gray-300">
      <View className="flex-row items-center mb-6">
        <View className="bg-gradient-to-br from-pink-100 to-pink-50 w-12 h-12 rounded-2xl items-center justify-center mr-3">
          <TrendingUp size={24} color="#ec4899" strokeWidth={2.5} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-gray-900">Sales Overview</Text>
          <Text className="text-sm text-gray-500 mt-0.5">This week (Mon - Sun)</Text>
        </View>
      </View>
      
      <View className="flex-row">
        {/* Y-axis labels */}
        <View className="justify-between mr-3" style={{ height: chartHeight }}>
          {[...yAxisLabels].reverse().map((label, index) => (
            <Text key={index} className="text-xs text-gray-400 font-medium">
              {formatCurrency(label)}
            </Text>
          ))}
        </View>
        
        {/* Chart area */}
        <View className="flex-1">
          {/* Chart bars container */}
          <View 
            className="flex-row items-end justify-between border-l border-b border-gray-200 pl-3"
            style={{ height: chartHeight }}
          >
            {data.map((item, index) => {
              const heightPercentage = yAxisMax > 0 ? (item.revenue / yAxisMax) : 0;
              const barHeight = Math.max(heightPercentage * (chartHeight - 10), 4);
              
              return (
                <View key={index} className="flex-1 items-center justify-end" style={{ paddingHorizontal: 4 }}>
                  {/* Revenue label above bar (only show if revenue > 0) */}
                  {item.revenue > 0 && (
                    <Text className="text-xs font-bold text-pink-600 mb-1">
                      {formatCurrency(item.revenue)}
                    </Text>
                  )}
                  
                  {/* Bar */}
                  <View 
                    className="bg-pink-500 rounded-t-lg shadow-sm"
                    style={{ 
                      height: barHeight,
                      width: '100%',
                      maxWidth: 40,
                      minWidth: 20
                    }}
                  />
                </View>
              );
            })}
          </View>
          
          {/* X-axis labels */}
          <View className="flex-row justify-between mt-3 pl-3">
            {data.map((item, index) => (
              <View key={index} className="flex-1 items-center" style={{ paddingHorizontal: 4 }}>
                <Text className="text-xs font-semibold text-gray-600">{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* Legend or summary */}
      <View className="mt-4 pt-4 border-t border-gray-100">
        <Text className="text-xs text-gray-500 text-center">
          Total Revenue: <Text className="font-bold text-pink-600">{formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}</Text>
        </Text>
      </View>
    </View>
  );
};