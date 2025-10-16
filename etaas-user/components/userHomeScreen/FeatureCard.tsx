import { FeatureCardProps } from "@/types/userHome";
import { View, Text } from "react-native";

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, subtitle }) => (
  <View className="bg-white rounded-2xl p-5 items-center shadow-sm flex-1 mx-1">
    <View className="bg-pink-50 rounded-full p-3 mb-3">
      <Icon size={24} color="#EC4899" strokeWidth={2} />
    </View>
    <Text className="text-gray-900 font-semibold text-sm text-center leading-tight">
      {title}
    </Text>
    {subtitle && (
      <Text className="text-gray-500 text-xs text-center mt-0.5">{subtitle}</Text>
    )}
  </View>
);
