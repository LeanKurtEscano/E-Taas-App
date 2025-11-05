import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Line, G, Text as SvgText, Rect } from 'react-native-svg';
import { useProductAnalytics } from '@/hooks/seller/useProductAnalytics';

interface LineChartProps {
  data: Array<{ date: string; revenue: number; units: number }>;
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, width, height }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.revenue));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.revenue / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding + chartHeight * (1 - ratio);
        return (
          <G key={i}>
            <Line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3e5f5"
              strokeWidth="1"
            />
            <SvgText
              x={padding - 10}
              y={y + 5}
              fontSize="10"
              fill="#9c27b0"
              textAnchor="end"
            >
              ₱{Math.round(maxValue * ratio)}
            </SvgText>
          </G>
        );
      })}

      {/* Line path */}
      <Path
        d={pathData}
        fill="none"
        stroke="#ec4899"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r="5" fill="#ec4899" />
          <Circle cx={p.x} cy={p.y} r="3" fill="white" />
          <SvgText
            x={p.x}
            y={height - padding + 20}
            fontSize="10"
            fill="#9c27b0"
            textAnchor="middle"
          >
            {p.date.split('/')[1]}/{p.date.split('/')[0]}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
};

interface BarChartProps {
  data: Array<{ combination: string; revenue: number }>;
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.revenue));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / data.length * 0.7;
  const gap = chartWidth / data.length * 0.3;

  return (
    <Svg width={width} height={height}>
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((ratio, i) => {
        const y = padding + chartHeight * (1 - ratio);
        return (
          <G key={i}>
            <Line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3e5f5"
              strokeWidth="1"
            />
            <SvgText
              x={padding - 10}
              y={y + 5}
              fontSize="10"
              fill="#9c27b0"
              textAnchor="end"
            >
              ₱{Math.round(maxValue * ratio)}
            </SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.revenue / maxValue) * chartHeight;
        const x = padding + i * (barWidth + gap);
        const y = padding + chartHeight - barHeight;

        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#ec4899"
              rx="4"
            />
            <SvgText
              x={x + barWidth / 2}
              y={y - 5}
              fontSize="10"
              fill="#9c27b0"
              textAnchor="middle"
              fontWeight="600"
            >
              ₱{d.revenue}
            </SvgText>
            <SvgText
              x={x + barWidth / 2}
              y={height - padding + 15}
              fontSize="9"
              fill="#9c27b0"
              textAnchor="middle"
            >
              {d.combination.length > 12 ? d.combination.substring(0, 12) + '...' : d.combination}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

const ProductAnalytics = () => {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const analytics = useProductAnalytics(productId || '');
  const screenWidth = Dimensions.get('window').width;

  if (analytics.loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-4 text-base text-purple-700 font-semibold">
          Loading Analytics...
        </Text>
      </View>
    );
  }

  if (analytics.error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-lg text-pink-500 font-bold mb-2">Error</Text>
        <Text className="text-sm text-purple-700 text-center">
          {analytics.error}
        </Text>
      </View>
    );
  }

  const { product } = analytics;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-pink-500 px-6 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white mb-1">
          {product?.name || 'Product Analytics'}
        </Text>
        <Text className="text-sm text-white opacity-90">
          {product?.category} • Performance Overview
        </Text>
      </View>

      <View className="p-4">
        {/* Overview Widgets */}
        <Text className="text-lg font-bold text-purple-700 mb-4">
          Overview
        </Text>
        
        <View className="flex-row flex-wrap -mx-1.5">
          {[
            { label: 'Total Revenue', value: `₱${analytics.totalRevenue.toFixed(2)}`, icon: '💰' },
            { label: 'Units Sold', value: analytics.totalUnitsSold.toString(), icon: '📦' },
            { label: 'Total Orders', value: analytics.totalOrders.toString(), icon: '🛒' },
            { label: 'Stock Left', value: analytics.totalStock.toString(), icon: '📊' },
            { label: 'Avg Order Value', value: `₱${analytics.averageOrderValue.toFixed(2)}`, icon: '💵' },
          ].map((widget, i) => (
            <View
              key={i}
              className="w-[48%] m-1.5 bg-pink-50 rounded-2xl p-4 border-2 border-pink-200"
            >
              <Text className="text-3xl mb-2">{widget.icon}</Text>
              <Text className="text-2xl font-bold text-pink-500 mb-1">
                {widget.value}
              </Text>
              <Text className="text-xs text-purple-700 font-semibold">
                {widget.label}
              </Text>
            </View>
          ))}
        </View>

        {product?.hasVariants && analytics.bestSellingVariant !== 'N/A' && (
          <View className="bg-purple-50 rounded-2xl p-4 mt-3 border-2 border-purple-200">
            <Text className="text-sm text-purple-700 font-semibold mb-1">
              🏆 Best-Selling Variant
            </Text>
            <Text className="text-xl font-bold text-pink-500">
              {analytics.bestSellingVariant}
            </Text>
          </View>
        )}

        {/* Sales Trend */}
        <Text className="text-lg font-bold text-purple-700 mt-8 mb-4">
          Sales Trend
        </Text>
        <View className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
          <LineChart 
            data={analytics.salesByDate} 
            width={screenWidth - 64} 
            height={220} 
          />
        </View>

        {/* Variant Performance */}
        {product?.hasVariants && analytics.variantAnalytics.length > 0 && (
          <>
            <Text className="text-lg font-bold text-purple-700 mt-8 mb-4">
              Variant Performance
            </Text>

            <View className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200 mb-4">
              <Text className="text-sm font-semibold text-purple-700 mb-3">
                Revenue by Variant
              </Text>
              <BarChart 
                data={analytics.variantAnalytics} 
                width={screenWidth - 64} 
                height={220} 
              />
            </View>

            {analytics.variantAnalytics.map((variant, i) => (
              <View
                key={i}
                className="bg-white rounded-2xl p-4 mb-3 border-2 border-pink-200"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base font-bold text-pink-500 flex-1">
                    {variant.combination}
                  </Text>
                  <View className="bg-pink-50 px-3 py-1 rounded-lg">
                    <Text className="text-xs font-semibold text-purple-700">
                      ₱{variant.price}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-xs text-purple-700 mb-0.5">Units Sold</Text>
                    <Text className="text-lg font-bold text-pink-500">
                      {variant.unitsSold}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-purple-700 mb-0.5">Revenue</Text>
                    <Text className="text-lg font-bold text-pink-500">
                      ₱{variant.revenue}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-purple-700 mb-0.5">Stock</Text>
                    <Text className="text-lg font-bold text-pink-500">
                      {variant.stock}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Non-variant product simple display */}
        {!product?.hasVariants && (
          <View className="bg-pink-50 rounded-2xl p-4 mt-4 border-2 border-pink-200">
            <Text className="text-sm font-semibold text-purple-700 mb-2">
              Product Details
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-purple-700 mb-0.5">Price</Text>
                <Text className="text-lg font-bold text-pink-500">
                  ₱{product?.price}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-purple-700 mb-0.5">Current Stock</Text>
                <Text className="text-lg font-bold text-pink-500">
                  {analytics.totalStock}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
      </View>
    </ScrollView>
  );
};

export default ProductAnalytics;