// Status Badge Component
import { View } from "react-native";
import { Text } from "react-native";
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isDelivered = status === 'delivered';
  const isReplied = status === 'replied';
  const bgColor = isDelivered || isReplied ? 'bg-emerald-100' : 'bg-pink-100';
  const textColor = isDelivered || isReplied ? 'text-emerald-700' : 'text-pink-700';
  
  return (
    <View className={`${bgColor} px-4 py-1.5 rounded-full`}>
      <Text className={`${textColor} text-xs font-semibold capitalize`}>{status}</Text>
    </View>
  );
};
