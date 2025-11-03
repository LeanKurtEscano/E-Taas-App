import { Order } from "@/types/order/sellerOrder";
import { View,Text } from "react-native";
import { User } from "lucide-react-native";
import { StatusBadge } from "./StatusBadge";

export const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const itemCount = order.items.length;
  const firstItem = order.items[0];
  const buyerName = order.shippingAddress?.fullName || 'N/A';

  return (
    <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          {/* Display first item name, with count if multiple items */}
          <Text className="text-base font-bold text-gray-900 mb-2">
            {firstItem?.productName || 'Unknown Product'}
            {itemCount > 1 && (
              <Text className="text-sm font-semibold text-pink-500">
                {' '}+{itemCount - 1} more item{itemCount - 1 > 1 ? 's' : ''}
              </Text>
            )}
          </Text>
          
          {/* Buyer name */}
          <View className="flex-row items-center">
            <User size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-600 ml-2">{buyerName}</Text>
          </View>
        </View>
        <StatusBadge status={order.status} />
      </View>
      
      {/* Total payment */}
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-sm font-medium text-gray-500">Total Payment</Text>
        <Text className="text-lg font-extrabold text-pink-500">
          ₱{order.totalPayment.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};
