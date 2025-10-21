import { StatCardProps } from "@/types/seller/manageProducts";
import { View, Text } from "react-native";


export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => (
    <View className="bg-white rounded-2xl p-4 flex-1 border border-gray-300" style={{ minHeight: 110 }}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-gray-500 text-xs font-medium">{title}</Text>
        {icon}
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
    </View>
  );


