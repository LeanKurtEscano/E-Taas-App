import { View,Text } from "react-native";

interface EmptyStateProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  title: string;
  message: string;
}

// Empty State Component
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message }) => (
  <View className="bg-gray-50 rounded-2xl p-8 items-center justify-center border-2 border-dashed border-gray-200">
    <View className="bg-pink-100 w-16 h-16 rounded-full items-center justify-center mb-4">
      <Icon size={32} color="#ec4899" strokeWidth={2} />
    </View>
    <Text className="text-gray-900 font-bold text-lg mb-2 text-center">{title}</Text>
    <Text className="text-gray-500 text-sm text-center leading-5">{message}</Text>
  </View>
);