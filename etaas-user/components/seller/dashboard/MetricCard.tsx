import { View,Text } from "react-native";
interface MetricCardProps {
  icon: any;
  value: string | number;
  label: string;
  iconBg: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, value, label, iconBg }) => (
  <View className="bg-white rounded-3xl p-6  border border-gray-300 flex-1">
    <View className={`${iconBg} w-14 h-14 rounded-2xl items-center justify-center mb-4`}>
      <Icon size={26} color="#ec4899" strokeWidth={2.5} />
    </View>
    <Text className="text-3xl font-extrabold text-gray-900 mb-2">{value}</Text>
    <Text className="text-sm font-medium text-gray-500">{label}</Text>
  </View>
);
