
// components/ProductVariantBuilder.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy2,
} from 'lucide-react-native';

interface VariantOption {
  id: string;
  name: string;
  stock?: number;
}

interface VariantCategory {
  id: string;
  name: string;
  options: VariantOption[];
  isExpanded: boolean;
}

interface Combination {
  id: string;
  selections: { [categoryId: string]: string };
  price?: number;
  stock: number;
}

interface ProductVariantBuilderProps {
  onVariantsChange?: (data: {
    categories: VariantCategory[];
    useCombinations: boolean;
    combinations: Combination[];
  }) => void;
}

const ProductVariantBuilder: React.FC<ProductVariantBuilderProps> = ({
  onVariantsChange,
}) => {
  const [categories, setCategories] = useState<VariantCategory[]>([]);
  const [useCombinations, setUseCombinations] = useState(false);
  const [combinations, setCombinations] = useState<Combination[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionStock, setNewOptionStock] = useState('');

  const [showNewCombination, setShowNewCombination] = useState(false);
  const [newCombinationSelections, setNewCombinationSelections] = useState<
    { [key: string]: string }
  >({});
  const [newCombinationPrice, setNewCombinationPrice] = useState('');
  const [newCombinationStock, setNewCombinationStock] = useState('');

  const notifyChange = () => {
    onVariantsChange?.({
      categories,
      useCombinations,
      combinations,
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    const newCategory: VariantCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      options: [],
      isExpanded: true,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setNewCategoryName('');
    setShowNewCategory(false);
    notifyChange();
  };

  const deleteCategory = (categoryId: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          const updatedCategories = categories.filter(c => c.id !== categoryId);
          setCategories(updatedCategories);
          const updatedCombinations = combinations.filter(
            comb => !comb.selections[categoryId]
          );
          setCombinations(updatedCombinations);
          notifyChange();
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setCategories(
      categories.map(c =>
        c.id === categoryId ? { ...c, isExpanded: !c.isExpanded } : c
      )
    );
  };

  const addOption = (categoryId: string) => {
    if (!newOptionName.trim()) {
      Alert.alert('Error', 'Please enter option name');
      return;
    }

    const updatedCategories = categories.map(c =>
      c.id === categoryId
        ? {
            ...c,
            options: [
              ...c.options,
              {
                id: Date.now().toString(),
                name: newOptionName.trim(),
                stock: newOptionStock ? parseInt(newOptionStock) : undefined,
              },
            ],
          }
        : c
    );

    setCategories(updatedCategories);
    setNewOptionName('');
    setNewOptionStock('');
    setActiveCategoryId(null);
    notifyChange();
  };

  const deleteOption = (categoryId: string, optionId: string) => {
    const updatedCategories = categories.map(c =>
      c.id === categoryId
        ? { ...c, options: c.options.filter(o => o.id !== optionId) }
        : c
    );
    setCategories(updatedCategories);

    const updatedCombinations = combinations.filter(
      comb => comb.selections[categoryId] !== optionId
    );
    setCombinations(updatedCombinations);
    notifyChange();
  };

  const addCombination = () => {
    const selectedCount = Object.keys(newCombinationSelections).length;
    if (selectedCount !== categories.length) {
      Alert.alert('Error', 'Please select an option from each category');
      return;
    }

    if (!newCombinationStock.trim() || isNaN(parseInt(newCombinationStock))) {
      Alert.alert('Error', 'Please enter valid stock');
      return;
    }

    const newCombination: Combination = {
      id: Date.now().toString(),
      selections: newCombinationSelections,
      price: newCombinationPrice ? parseInt(newCombinationPrice) : undefined,
      stock: parseInt(newCombinationStock),
    };

    const updatedCombinations = [...combinations, newCombination];
    setCombinations(updatedCombinations);
    setNewCombinationSelections({});
    setNewCombinationPrice('');
    setNewCombinationStock('');
    setShowNewCombination(false);
    notifyChange();
  };

  const deleteCombination = (combinationId: string) => {
    const updatedCombinations = combinations.filter(c => c.id !== combinationId);
    setCombinations(updatedCombinations);
    notifyChange();
  };

  const duplicateCombination = (combination: Combination) => {
    const newCombination: Combination = {
      id: Date.now().toString(),
      selections: { ...combination.selections },
      price: combination.price,
      stock: combination.stock,
    };

    const updatedCombinations = [...combinations, newCombination];
    setCombinations(updatedCombinations);
    notifyChange();
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const getOptionName = (categoryId: string, optionId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.options.find(o => o.id === optionId)?.name || '';
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mt-6 mb-6">
          <Text className="text-xl font-bold text-gray-900">Product Variants</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Create variant categories and combinations
          </Text>
        </View>

        {/* Variant Categories Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Categories</Text>
            {categories.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowNewCategory(!showNewCategory)}
                className="bg-pink-500 rounded-full p-2"
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {categories.length === 0 ? (
            <View className="bg-white rounded-xl p-6 border border-gray-200 items-center">
              <Text className="text-gray-600 text-center mb-4 font-medium">
                No variant categories yet
              </Text>
              <TouchableOpacity
                onPress={() => setShowNewCategory(true)}
                className="bg-pink-500 rounded-xl px-6 py-3 flex-row items-center"
              >
                <Plus size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Add Category</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* New Category Form */}
          {showNewCategory && (
            <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
              <View className="flex-row items-center mb-3">
                <TextInput
                  className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 text-base border border-gray-200 mr-2"
                  placeholder="e.g., Color, Size"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={addCategory}
                  className="bg-pink-500 rounded-lg p-3"
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                }}
                className="flex-row items-center justify-center py-2"
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories List */}
          {categories.map(category => (
            <View
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden"
            >
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => toggleCategoryExpansion(category.id)}
                className="flex-row items-center justify-between px-4 py-4 bg-gray-50"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-base font-semibold text-gray-900 flex-1">
                    {category.name}
                  </Text>
                  <View className="bg-pink-100 rounded-full px-3 py-1 mr-2">
                    <Text className="text-pink-700 text-xs font-semibold">
                      {category.options.length}
                    </Text>
                  </View>
                </View>
                {category.isExpanded ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>

              {/* Category Content */}
              {category.isExpanded && (
                <View className="px-4 py-4 border-t border-gray-100">
                  {/* Options List */}
                  {category.options.length > 0 && (
                    <View className="mb-3">
                      {category.options.map((option, idx) => (
                        <View
                          key={option.id}
                          className={`flex-row items-center justify-between py-3 ${
                            idx < category.options.length - 1
                              ? 'border-b border-gray-100'
                              : ''
                          }`}
                        >
                          <View className="flex-1">
                            <Text className="text-gray-900 font-medium">
                              {option.name}
                            </Text>
                            {option.stock !== undefined && (
                              <Text className="text-gray-500 text-xs mt-1">
                                Stock: {option.stock}
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => deleteOption(category.id, option.id)}
                            className="p-2"
                          >
                            <Trash2 size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Option */}
                  {activeCategoryId === category.id ? (
                    <View className="bg-gray-50 rounded-lg p-3">
                      <TextInput
                        className="bg-white rounded-lg px-3 py-2 text-gray-900 text-base border border-gray-200 mb-2"
                        placeholder="Option name"
                        value={newOptionName}
                        onChangeText={setNewOptionName}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        className="bg-white rounded-lg px-3 py-2 text-gray-900 text-base border border-gray-200 mb-3"
                        placeholder="Stock (optional)"
                        value={newOptionStock}
                        onChangeText={setNewOptionStock}
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => addOption(category.id)}
                          className="flex-1 bg-pink-500 rounded-lg py-2 items-center"
                        >
                          <Text className="text-white font-semibold">Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setActiveCategoryId(null);
                            setNewOptionName('');
                            setNewOptionStock('');
                          }}
                          className="flex-1 bg-gray-200 rounded-lg py-2 items-center"
                        >
                          <Text className="text-gray-700 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setActiveCategoryId(category.id)}
                      className="flex-row items-center justify-center py-3 bg-gray-50 rounded-lg"
                    >
                      <Plus size={18} color="#EC4899" />
                      <Text className="text-pink-500 font-semibold ml-2">
                        Add Option
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Category Button */}
                  <TouchableOpacity
                    onPress={() => deleteCategory(category.id)}
                    className="flex-row items-center justify-center py-3 mt-3 border-t border-gray-100 bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} color="#EF4444" />
                    <Text className="text-red-500 font-semibold ml-2">
                      Delete Category
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Use Combinations Toggle */}
        {categories.length > 0 && (
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Use Combinations
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {useCombinations
                    ? 'Manual combination setup'
                    : 'Per-option stock management'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setUseCombinations(!useCombinations);
                  if (useCombinations) {
                    setCombinations([]);
                  }
                  notifyChange();
                }}
                className={`w-14 h-8 rounded-full flex items-center px-1 ${
                  useCombinations ? 'bg-pink-500' : 'bg-gray-300'
                }`}
                style={{
                  justifyContent: useCombinations ? 'flex-end' : 'flex-start',
                }}
              >
                <View className="w-6 h-6 rounded-full bg-white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Combinations Section */}
        {useCombinations && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Combinations</Text>
              {combinations.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowNewCombination(!showNewCombination)}
                  className="bg-pink-500 rounded-full p-2"
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {combinations.length === 0 && !showNewCombination ? (
              <View className="bg-white rounded-xl p-6 border border-gray-200 items-center">
                <Text className="text-gray-600 text-center mb-4 font-medium">
                  No combinations yet
                </Text>
                <TouchableOpacity
                  onPress={() => setShowNewCombination(true)}
                  className="bg-pink-500 rounded-xl px-6 py-3 flex-row items-center"
                >
                  <Plus size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Create Combination
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* New Combination Form */}
            {showNewCombination && (
              <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Create Combination
                </Text>

                {/* Category Selection */}
                {categories.map(category => (
                  <View key={category.id} className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      {category.name} *
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row">
                        {category.options.map(option => (
                          <TouchableOpacity
                            key={option.id}
                            onPress={() =>
                              setNewCombinationSelections({
                                ...newCombinationSelections,
                                [category.id]: option.id,
                              })
                            }
                            className={`px-4 py-2 rounded-full mr-2 ${
                              newCombinationSelections[category.id] === option.id
                                ? 'bg-pink-500'
                                : 'bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <Text
                              className={`font-medium text-sm ${
                                newCombinationSelections[category.id] === option.id
                                  ? 'text-white'
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ))}

                {/* Price and Stock */}
                <TextInput
                  className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 text-base border border-gray-200 mb-3"
                  placeholder="Price (optional)"
                  value={newCombinationPrice}
                  onChangeText={setNewCombinationPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 text-base border border-gray-200 mb-4"
                  placeholder="Stock *"
                  value={newCombinationStock}
                  onChangeText={setNewCombinationStock}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={addCombination}
                    className="flex-1 bg-pink-500 rounded-lg py-3 items-center"
                  >
                    <Text className="text-white font-semibold">Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowNewCombination(false);
                      setNewCombinationSelections({});
                      setNewCombinationPrice('');
                      setNewCombinationStock('');
                    }}
                    className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  >
                    <Text className="text-gray-700 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Combinations List */}
            {combinations.map(combination => (
              <View
                key={combination.id}
                className="bg-white rounded-xl p-4 border border-gray-200 mb-3"
              >
                {/* Combination Details */}
                <View className="mb-3">
                  {Object.entries(combination.selections).map(([categoryId, optionId]) => (
                    <View key={categoryId} className="flex-row items-center mb-2">
                      <Text className="text-gray-600 text-sm font-medium w-20">
                        {getCategoryName(categoryId)}:
                      </Text>
                      <Text className="text-gray-900 text-sm font-semibold flex-1">
                        {getOptionName(categoryId, optionId)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Stock and Price Display */}
                <View className="flex-row items-center gap-3 py-3 border-t border-gray-100">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Stock</Text>
                    <Text className="text-gray-900 font-semibold">
                      {combination.stock}
                    </Text>
                  </View>
                  {combination.price !== undefined && (
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs">Price</Text>
                      <Text className="text-gray-900 font-semibold">
                        ₱{combination.price}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    onPress={() => duplicateCombination(combination)}
                    className="flex-1 flex-row items-center justify-center bg-blue-50 rounded-lg py-2"
                  >
                    <Copy2 size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-medium ml-1">Duplicate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteCombination(combination.id)}
                    className="flex-1 flex-row items-center justify-center bg-red-50 rounded-lg py-2"
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text className="text-red-600 font-medium ml-1">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary Section */}
        {categories.length > 0 && (
          <View className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 mb-10">
            <Text className="text-base font-semibold text-gray-900 mb-2">Summary</Text>
            <View>
              <Text className="text-gray-700 text-sm mb-1">
                • {categories.length} variant categor{categories.length !== 1 ? 'ies' : 'y'}
              </Text>
              <Text className="text-gray-700 text-sm mb-1">
                • {categories.reduce((sum, c) => sum + c.options.length, 0)} total
                options
              </Text>
              {useCombinations && (
                <Text className="text-gray-700 text-sm">
                  • {combinations.length} combinations defined
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProductVariantBuilder;