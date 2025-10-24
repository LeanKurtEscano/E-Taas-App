import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import { Product, Variant } from '@/types/product/product';

interface ProductDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (product: Product, variant: Variant | null, quantity: number) => void;
}


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isVisible,
  onClose,
  product,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [slideAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    if (isVisible && product) {
      console.log('🛍️ PRODUCT DATA:', product.name);
      setSelectedOptions({});
      setQuantity(1);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, product]);

  // Get currently selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.hasVariants || !product.variants || !product.variantCategories) {
      return null;
    }

    const allCategoriesSelected = product.variantCategories.every(
      (cat) => selectedOptions[cat.id]
    );

    if (!allCategoriesSelected) return null;

    const selectedCombination = product.variantCategories.map(
      (cat) => selectedOptions[cat.id]
    );

    return product.variants.find((variant) =>
      variant.combination.every((val, idx) => val === selectedCombination[idx])
    );
  }, [product, selectedOptions]);


  const isOptionAvailable = (categoryIndex: number, value: string): boolean => {
    if (!product?.variants || !product.variantCategories) return false;

    const currentSelections: Record<number, string> = {};
    product.variantCategories.forEach((cat, idx) => {
      if (idx !== categoryIndex && selectedOptions[cat.id]) {
        currentSelections[idx] = selectedOptions[cat.id];
      }
    });

    return product.variants.some((variant) => {
      if (variant.combination[categoryIndex] !== value) return false;
      if (variant.stock <= 0) return false;
      return Object.entries(currentSelections).every(
        ([idx, selectedValue]) => variant.combination[Number(idx)] === selectedValue
      );
    });
  };


  //for first category only
  const getImageForValue = (categoryIndex: number, value: string): string | undefined => {
    if (!product?.variants || categoryIndex !== 0) return undefined;

    const variant = product.variants.find(
      (v) => v.combination[categoryIndex] === value && v.image
    );
    return variant?.image;
  };


  const handleSelectOption = (categoryId: string, value: string) => {
    setSelectedOptions((prev) => {

      if (prev[categoryId] === value) {
        const newOptions = { ...prev };
        delete newOptions[categoryId];
        return newOptions;
      }


      return {
        ...prev,
        [categoryId]: value,
      };
    });
  };

  const incrementQuantity = () => {
    const maxStock = selectedVariant?.stock || product?.quantity || 999;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.hasVariants && !selectedVariant) {
      return;
    }

    onAddToCart?.(product, selectedVariant, quantity);
    onClose();
  };


  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentStock = selectedVariant?.stock || product?.quantity || 0;
  const currentImage = selectedVariant?.image || product?.images?.[0] || '';

  const canAddToCart = product?.hasVariants
    ? selectedVariant !== null && currentStock > 0
    : (product?.quantity || 0) > 0;

  if (!product) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          style={{
            transform: [{ translateY }],
            height: SCREEN_HEIGHT * 0.85
          }}
          className="bg-white rounded-t-3xl"
        >

          <View className="flex-row items-start p-6 border-b border-gray-200">
            <View className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
              {currentImage ? (
                <Image
                  source={{ uri: currentImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-200 items-center justify-center">
                  <Text className="text-gray-400 text-xs">No Image</Text>
                </View>
              )}
            </View>

            <View className="flex-1 ml-4 mt-1 ">
              <Text className="text-2xl font-bold text-orange-500 mb-2">
                ₱{currentPrice.toFixed(2)}
              </Text>
              <Text className="text-gray-600 text-base mb-2">
                Stock: {currentStock}
              </Text>
              {currentStock > 0 && currentStock < 10 && (
                <View className="bg-orange-100 px-3 py-1 rounded-full self-start">
                  <Text className="text-orange-600 text-xs font-semibold">
                    Low Stock
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="p-2 -mt-2 -mr-2"
              activeOpacity={0.7}
            >
              <X size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
              flexGrow: 1,
            }}
          >

            <View className="p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900 mb-3 bg-blue-100 p-2 rounded">
                {product.name || "No Name"}
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                {product.description || "No description"}
              </Text>
            </View>


            {product.hasVariants && product.variantCategories && product.variantCategories.length > 0 && (
              <View className="p-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">Select Variants:</Text>
                {product.variantCategories.map((category, categoryIndex) => (
                  <View key={category.id} className="mb-6">
                    <Text className="text-base font-semibold text-gray-800 mb-3">
                      {category.name}:
                    </Text>

                    <View className="flex-row flex-wrap gap-3">
                      {category.values.map((value) => {
                        const isAvailable = isOptionAvailable(categoryIndex, value);
                        const isSelected = selectedOptions[category.id] === value;
                        const valueImage = categoryIndex === 0 ? getImageForValue(categoryIndex, value) : undefined;

                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() =>
                              isAvailable && handleSelectOption(category.id, value)
                            }
                            disabled={!isAvailable}
                            activeOpacity={0.7}
                            className={`
                              flex-row items-center px-4 py-3 rounded-lg border-2
                              ${isSelected
                                ? 'border-orange-500 bg-orange-50'
                                : isAvailable
                                  ? 'border-gray-300 bg-white'
                                  : 'border-gray-200 bg-gray-100'
                              }
                              ${!isAvailable && 'opacity-50'}
                            `}
                          >
                            {categoryIndex === 0 && valueImage && (
                              <Image
                                source={{ uri: valueImage }}
                                className="w-8 h-8 rounded mr-2 bg-gray-100"
                                resizeMode="cover"
                              />
                            )}
                            <Text
                              className={`
                                font-medium
                                ${isSelected
                                  ? 'text-orange-500'
                                  : isAvailable
                                    ? 'text-gray-800'
                                    : 'text-gray-400'
                                }
                              `}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}


            <View className="px-6 pb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-800">
                  Quantity
                </Text>

                <View className="flex-row items-center bg-gray-100 rounded-lg border border-gray-300">
                  <TouchableOpacity
                    onPress={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-3"
                    activeOpacity={0.7}
                  >
                    <Minus
                      size={20}
                      color={quantity <= 1 ? '#ccc' : '#666'}
                    />
                  </TouchableOpacity>

                  <Text className="text-lg font-semibold text-gray-800 min-w-[40px] text-center">
                    {quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={incrementQuantity}
                    disabled={quantity >= currentStock}
                    className="p-3"
                    activeOpacity={0.7}
                  >
                    <Plus
                      size={20}
                      color={quantity >= currentStock ? '#ccc' : '#666'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>


          <View className="p-6 border-t border-gray-200 bg-white">
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={!canAddToCart}
              activeOpacity={0.8}
              className={`
                py-4 rounded-lg items-center
                ${canAddToCart ? 'bg-orange-500' : 'bg-gray-300'}
              `}
            >
              <Text
                className={`
                  text-lg font-bold
                  ${canAddToCart ? 'text-white' : 'text-gray-500'}
                `}
              >
                {product.hasVariants && !selectedVariant
                  ? 'Select Variant'
                  : !canAddToCart
                    ? 'Out of Stock'
                    : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ProductDetailsModal;