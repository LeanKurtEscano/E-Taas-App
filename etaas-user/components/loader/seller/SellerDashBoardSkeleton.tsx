import React, { useEffect, useRef } from 'react';
import { View, Animated, ScrollView } from 'react-native';


const SkeletonBox = ({ 
  width, 
  height, 
  rounded = 'rounded-lg',
  className = '' 
}: { 
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const style = {
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
  };

  return (
    <Animated.View
      style={[style, { opacity }]}
      className={`bg-gray-200 ${rounded} ${width ? '' : 'w-full'} ${className}`}
    />
  );
};

const MetricCardSkeleton = () => (
  <View className="bg-white rounded-3xl p-6 border border-gray-300 flex-1">
    <SkeletonBox width={56} height={56} rounded="rounded-2xl" className="mb-4" />
    <SkeletonBox height={36} className="mb-2" />
    <SkeletonBox height={16} width="60%" />
  </View>
);

const OrderItemSkeleton = () => (
  <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100 shadow-sm">
    <View className="flex-row justify-between items-start mb-3">
      <View className="flex-1 mr-3">
        <SkeletonBox height={20} className="mb-2" />
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} rounded="rounded-full" />
          <SkeletonBox height={16} width="40%" className="ml-2" />
        </View>
      </View>
      <SkeletonBox width={80} height={28} rounded="rounded-full" />
    </View>
    
    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
      <SkeletonBox height={16} width="30%" />
      <SkeletonBox height={24} width="25%" />
    </View>
  </View>
);

const InquiryItemSkeleton = () => (
  <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100 shadow-sm">
    <View className="flex-row justify-between items-start mb-3">
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <SkeletonBox width={16} height={16} rounded="rounded-full" />
          <SkeletonBox height={20} width="40%" className="ml-2" />
        </View>
        
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-1.5">
            <SkeletonBox height={14} width={64} />
            <SkeletonBox height={14} className="flex-1 ml-2" />
          </View>
          <View className="flex-row items-center">
            <SkeletonBox height={14} width={64} />
            <SkeletonBox height={14} width="50%" className="ml-2" />
          </View>
        </View>
        
        <View>
          <SkeletonBox height={14} width="20%" className="mb-1" />
          <SkeletonBox height={16} className="mb-1" />
          <SkeletonBox height={16} className="mb-1" />
          <SkeletonBox height={16} width="70%" />
        </View>
      </View>
    </View>
  </View>
);

const ChartSkeleton = () => (
  <View className="bg-white rounded-3xl p-6 border border-gray-300">
    <View className="flex-row items-center mb-6">
      <SkeletonBox width={48} height={48} rounded="rounded-2xl" className="mr-3" />
      <View className="flex-1">
        <SkeletonBox height={24} width="50%" className="mb-2" />
        <SkeletonBox height={16} width="70%" />
      </View>
    </View>
    
    <View className="flex-row">
      <View className="justify-between mr-3" style={{ height: 160 }}>
        {[...Array(5)].map((_, i) => (
          <SkeletonBox key={i} height={12} width={40} />
        ))}
      </View>
      
      <View className="flex-1">
        <View 
          className="flex-row items-end justify-between border-l border-b border-gray-200 pl-3"
          style={{ height: 160 }}
        >
          {[...Array(7)].map((_, i) => (
            <View key={i} className="flex-1 items-center justify-end px-1">
              <SkeletonBox 
                height={Math.random() * 80 + 40} 
                rounded="rounded-t-lg"
                className="w-full max-w-[40px]"
              />
            </View>
          ))}
        </View>
        
        <View className="flex-row justify-between mt-3 pl-3">
          {[...Array(7)].map((_, i) => (
            <View key={i} className="flex-1 items-center px-1">
              <SkeletonBox height={12} width={24} />
            </View>
          ))}
        </View>
      </View>
    </View>
    
    <View className="mt-4 pt-4 border-t border-gray-100">
      <SkeletonBox height={14} width="60%" className="mx-auto" />
    </View>
  </View>
);

export const SellerDashboardSkeleton = () => {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section Skeleton */}
        <View className="bg-pink-500 px-6 pt-8 pb-10 rounded-b-[32px]">
          <SkeletonBox height={32} width="70%" className="mb-2 bg-pink-400" />
          <SkeletonBox height={20} width="50%" className="mb-2 bg-pink-400" />
          <SkeletonBox height={16} width="85%" className="bg-pink-400" />
        </View>

        <View className="px-6 py-6">
          {/* Metric Cards Skeleton */}
          <View className="mb-8">
            <View className="flex-row gap-4 mb-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </View>
            <View className="flex-row gap-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </View>
          </View>

          {/* Chart Skeleton */}
          <View className="mb-8">
            <ChartSkeleton />
          </View>

          {/* Recent Orders Skeleton */}
          <View className="mb-8">
            <View className="flex-row items-center mb-5">
              <SkeletonBox width={40} height={40} rounded="rounded-xl" className="mr-3" />
              <SkeletonBox height={28} width="45%" />
            </View>
            <OrderItemSkeleton />
            <OrderItemSkeleton />
            <OrderItemSkeleton />
            <SkeletonBox height={56} rounded="rounded-2xl" className="mt-2" />
          </View>

          {/* Recent Inquiries Skeleton */}
          <View className="mb-8">
            <View className="flex-row items-center mb-5">
              <SkeletonBox width={40} height={40} rounded="rounded-xl" className="mr-3" />
              <SkeletonBox height={28} width="50%" />
            </View>
            <InquiryItemSkeleton />
            <InquiryItemSkeleton />
            <InquiryItemSkeleton />
            <SkeletonBox height={56} rounded="rounded-2xl" className="mt-2" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};