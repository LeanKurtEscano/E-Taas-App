// HomeScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  FlatList,

  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
import { router } from 'expo-router';
import { productCategories,serviceCategories,heroBanners,featuredProducts,features } from '@/constants/userHomeScreen';
import { ProductCategory } from '@/components/user/userHomeScreen/ProductCategory';
import { ServiceCategory } from '@/components/user/userHomeScreen/ServiceCategory';
const HomeScreen = () => {


  const renderFeaturedProduct = ({ item }: { item: typeof featuredProducts[0] }) => (
    <TouchableOpacity 
      className="bg-white rounded-3xl mr-4 overflow-hidden active:opacity-90"
      style={{ 
        width: 170,
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-gray-800 font-bold text-sm mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-pink-500 font-bold text-lg">{item.price}</Text>
          <View className="flex-row items-center bg-pink-50 px-2 py-1 rounded-full">
            <Text className="text-pink-500 text-xs mr-1">⭐</Text>
            <Text className="text-pink-500 text-xs font-bold">{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

 

  return (
    <SafeAreaView className="flex-1 bg-gray-50"   edges={['top']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Hero Banner Section */}
        <View className="py-5">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            snapToInterval={width - 32}
            decelerationRate="fast"
          >
            {heroBanners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                className="rounded-3xl overflow-hidden mr-4 active:scale-98"
                style={{ 
                  width: width - 32, 
                  height: 180,
                  shadowColor: '#ec4899',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 15,
                  elevation: 8,
                }}
              >
                <Image
                  source={{ uri: banner.image }}
                  className="w-full h-full absolute"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 justify-end p-6">
                  <Text className="text-white font-bold text-2xl mb-1">
                    {banner.title}
                  </Text>
                  <Text className="text-white/90 text-sm mb-4">
                    {banner.subtitle}
                  </Text>
                  <TouchableOpacity 
                  onPress={() => banner.title.toLowerCase().includes('services') ? router.push('/services') : router.push('/products')}
                    className="bg-pink-500 rounded-full px-6 py-3 self-start active:bg-pink-600"
                    style={{
                      shadowColor: '#ec4899',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Text className="text-white font-bold text-sm">
                      {banner.title.toLowerCase().includes('services') ? 'Explore Services' : 'Shop Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Categories Section */}
        <View className="py-5">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Shop by Category
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Find what you're looking for
              </Text>
            </View>
            <TouchableOpacity className="bg-pink-50 px-4 py-2 rounded-full">
              <Text className="text-pink-500 font-bold text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={productCategories}
            renderItem={({ item }) => <ProductCategory item={item} />}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          />
        </View>

        {/* Featured Products Section */}
        <View className="py-5 bg-white">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Featured Products
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Handpicked for you
              </Text>
            </View>
            <TouchableOpacity className="bg-pink-50 px-4 py-2 rounded-full">
              <Text className="text-pink-500 font-bold text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          />
        </View>

        {/* Service Categories Section */}
        <View className="py-5 ">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Browse Services
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Everything you need
              </Text>
            </View>
            <TouchableOpacity className="bg-pink-50 px-4 py-2 rounded-full">
              <Text className="text-pink-500 font-bold text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={serviceCategories}
            renderItem={({ item }) => <ServiceCategory item={item} />}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          />
        </View>

        {/* Why Shop With Us Section - Widget Grid */}
        <View className="px-4 bg-white py-5">
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              Why Shop With Us
            </Text>
            <Text className="text-gray-500 text-sm">
              Your satisfaction is our priority
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {features.map((feature) => (
              <View 
                key={feature.id}
                className="bg-white border border-gray-200 rounded-3xl p-5 items-center mb-3"
                style={{ 
                  width: (width - 48) / 2 - 6,
                  
                  elevation: 5,
                }}
              >
                <View 
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={28} color={feature.color} strokeWidth={2.5} />
                </View>
                <Text className="text-gray-800 font-bold text-base mb-1 text-center">
                  {feature.title}
                </Text>
                <Text className="text-gray-500 text-xs text-center">
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;