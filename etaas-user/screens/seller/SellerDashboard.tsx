import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import {
  ShoppingBag,
  CheckCircle,
  DollarSign,
  MessageSquare,
  Package,
} from 'lucide-react-native';
import { useSellerDashboard } from '@/hooks/seller/useDashboard';
import { router } from 'expo-router';
import { InquiryItem } from '@/components/seller/dashboard/InquiryItem';
import { SimpleBarChart } from '@/components/seller/dashboard/BarChart';
import { OrderItem } from '@/components/seller/dashboard/RecentOrderItem';
import { MetricCard } from '@/components/seller/dashboard/MetricCard';
import { SellerDashboardSkeleton } from '@/components/loader/seller/SellerDashBoardSkeleton';
import { EmptyState } from '@/components/seller/dashboard/EmptyState';

export default function SellerDashboard() {
  const {
    userData,
    metrics,
    chartData,
    recentOrders,
    recentInquiriesData,
    refreshing,
    refreshDashboard
  } = useSellerDashboard();

  if (!userData || !metrics || !chartData || !recentOrders || !recentInquiriesData) {
    return <SellerDashboardSkeleton />;
  }

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1_000_000) {
      return (revenue / 1_000_000).toFixed(1) + 'M';
    } else if (revenue >= 1_000) {
      return (revenue / 1_000).toFixed(1) + 'K';
    } else {
      return revenue.toString();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshDashboard}
            colors={['#ec4899']} // Pink color for Android
            tintColor="#ec4899" // Pink color for iOS
          />
        }
      >
        {/* Header Section */}
        <View className="bg-pink-500 px-6 pt-8 pb-10 rounded-b-[32px]">
          <Text className="text-white text-2xl font-extrabold mb-2">
            Welcome back, {userData?.sellerInfo?.name?.split(' ')[0] || ''}
          </Text>
          <Text className="text-pink-50 text-base font-semibold">
            {userData.sellerInfo.businessName}
          </Text>
          <Text className="text-white text-sm mt-2">
            Here's your business performance overview.
          </Text>
        </View>

        <View className="px-6 py-6">
          {/* Summary Metrics Cards - 2x2 Grid */}
          <View className="mb-8">
            <View className="flex-row gap-4 mb-4">
              <MetricCard
                icon={ShoppingBag}
                value={metrics.totalOrders}
                label="Total Orders"
                iconBg="bg-pink-100"
              />
              <MetricCard
                icon={CheckCircle}
                value={metrics.deliveredOrders}
                label="Delivered"
                iconBg="bg-pink-100"
              />
            </View>
            <View className="flex-row gap-4">
              <MetricCard
                icon={DollarSign}
                value={`₱${formatRevenue(metrics.totalRevenue)}`}
                label="Total Revenue"
                iconBg="bg-pink-100"
              />
              <MetricCard
                icon={MessageSquare}
                value={metrics.totalInquiries}
                label="Total Inquiries"
                iconBg="bg-pink-100"
              />
            </View>
          </View>

          {/* Sales Overview Chart */}
          <View className="mb-8">
            <SimpleBarChart data={chartData} />
          </View>

          {/* Recent Orders */}
          <View className="mb-8">
            <View className="flex-row items-center mb-5">
              <View className="bg-pink-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                <Package size={22} color="#ec4899" strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-extrabold text-gray-900">Recent Orders</Text>
            </View>

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Orders Yet"
                message="You haven't received any orders from customers yet. Orders will appear here once customers start purchasing."
              />
            ) : (
              <>
                {recentOrders.map((order) => (
                  <OrderItem key={order.id} order={order} />
                ))}
                <TouchableOpacity
                  onPress={() => router.push('/seller/orders')}
                  className="bg-pink-500 rounded-2xl py-4 items-center mt-2"
                >
                  <Text className="text-white font-bold text-base">View All Orders</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Recent Inquiries */}
          <View className="mb-8">
            <View className="flex-row items-center mb-5">
              <View className="bg-pink-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                <MessageSquare size={22} color="#ec4899" strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-extrabold text-gray-900">Recent Inquiries</Text>
            </View>

            {recentInquiriesData.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Inquiries Yet"
                message="You haven't received any inquiries from customers yet. Customer questions will appear here."
              />
            ) : (
              <>
                {recentInquiriesData.map((inquiry) => (
                  <InquiryItem key={inquiry.id} inquiry={inquiry} />
                ))}
                <TouchableOpacity className="bg-pink-500 rounded-2xl py-4 items-center mt-2">
                  <Text className="text-white font-bold text-base">View All Inquiries</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}