import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import {

    ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FeatureCard } from '@/components/userHomeScreen/FeatureCard';
import { CategoryCard } from '@/components/userHomeScreen/CategoryCard';
import { PromoBanner } from '@/components/userHomeScreen/PromoBanner';



import { MOCK_CATEGORIES, MOCK_PROMOS, FEATURES } from '@/constants/userHomeScreen';
import { Category, Promo } from '@/types/userHome';

const HomeScreen: React.FC = () => {

    const handleCategoryPress = (category: Category): void => {
        console.log('Navigate to:', category.title);
    };

    const handlePromoPress = (promo: Promo): void => {
        console.log('Promo pressed:', promo.title);
    };

    const handleViewAllCategories = (): void => {
        console.log('View all categories');
    };

    const handleNavigationPress = (route: string): void => {
        console.log('Navigate to:', route);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                bounces={true}
            >
                {/* Promo Banners */}
                <View className="mt-4 mb-6">
                    {MOCK_PROMOS.map((promo) => (
                        <PromoBanner
                            key={promo.id}
                            title={promo.title}
                            subtitle={promo.subtitle}
                            bgClass={promo.bgClass}
                            emoji={promo.emoji}
                            onPress={() => handlePromoPress(promo)}
                        />
                    ))}
                </View>

                {/* Features Section */}
                <View className="px-5 mb-6">
                    <View className="flex-row justify-between">
                        {FEATURES.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                subtitle={feature.subtitle}
                            />
                        ))}
                    </View>
                </View>


                <View className="mb-6 ">
                    <View className="flex-row justify-between items-center px-5 mb-3">
                        <Text className="text-gray-900 text-xl font-bold">
                            Shop by Category
                        </Text>
                        <TouchableOpacity
                            className="flex-row items-center"
                            activeOpacity={0.7}
                            onPress={handleViewAllCategories}
                        >
                            <Text className="text-pink-500 font-semibold mr-1">
                                View All
                            </Text>
                            <ChevronRight size={20} color="#EC4899" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 10 }}
                    >
                        {MOCK_CATEGORIES.map((category) => (
                            <CategoryCard
                                key={category.id}
                                item={category}
                                onPress={handleCategoryPress}
                            />
                        ))}
                    </ScrollView>
                </View>



                <View className="px-5   mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">
                        Special Offers
                    </Text>

                   

                </View>

            </ScrollView>
        </View>
    );
};

export default HomeScreen;