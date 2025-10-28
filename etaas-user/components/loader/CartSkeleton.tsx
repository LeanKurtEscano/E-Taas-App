import { View } from "react-native";

export const CartSkeleton = () => {
  return (
    <View className="bg-white rounded-2xl p-4 mx-4 mb-4">
      {/* Shop Header Skeleton */}
      <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
        <View className="w-6 h-6 bg-gray-200 rounded-md mr-2" />
        <View className="w-8 h-8 bg-gray-200 rounded-lg mr-2" />
        <View className="flex-1 h-4 bg-gray-200 rounded" />
      </View>

      {/* Product Items Skeleton */}
      {[1, 2].map((item) => (
        <View key={item} className="flex-row mb-4 pb-4 border-b border-gray-100">
          <View className="w-6 h-6 bg-gray-200 rounded-md mr-3" />
          <View className="w-[90px] h-[90px] bg-gray-200 rounded-xl mr-3" />
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 w-full" />
            <View className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
            <View className="h-5 bg-gray-200 rounded mb-3 w-1/3" />
            <View className="w-24 h-8 bg-gray-200 rounded-full" />
          </View>
        </View>
      ))}

      {/* Total Skeleton */}
      <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
        <View className="h-4 bg-gray-200 rounded w-1/3" />
        <View className="h-6 bg-gray-200 rounded w-1/4" />
      </View>
    </View>
  );
};