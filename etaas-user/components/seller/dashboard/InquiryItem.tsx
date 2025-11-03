import { InquiryData } from "@/hooks/general/useInquiries";
import { User } from "lucide-react-native";
import { View,Text } from "react-native";
export const InquiryItem: React.FC<{ inquiry: InquiryData }> = ({ inquiry }) => (
  <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100 shadow-sm">
    <View className="flex-row justify-between items-start mb-3">
      <View className="flex-1">
        {/* Customer Name with icon */}
        <View className="flex-row items-center mb-2">
          <User size={16} color="#ec4899" />
          <Text className="text-base font-bold text-gray-900 ml-2">{inquiry.customerName}</Text>
        </View>
        
        {/* Contact Information */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-1.5">
            <Text className="text-xs font-semibold text-gray-500 w-16">Email:</Text>
            <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{inquiry.customerEmail}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-gray-500 w-16">Phone:</Text>
            <Text className="text-sm text-gray-700">{inquiry.customerPhone}</Text>
          </View>
        </View>
        
        {/* Message */}
        <View>
          <Text className="text-xs font-semibold text-gray-500 mb-1">Message:</Text>
          <Text className="text-sm text-gray-700 leading-5" numberOfLines={3}>
            {inquiry.message}
          </Text>
        </View>
      </View>
    </View>
  </View>
);
