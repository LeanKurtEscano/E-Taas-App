// components/VariantModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Trash2, Upload, Edit3, Check, X as XIcon, ChevronDown, ChevronUp, Square, CheckSquare } from 'lucide-react-native';
import useVariant from '@/hooks/seller/useVariant';

export interface VariantCategory {
  id: string;
  name: string;
  values: string[];
}

export interface Variant {
  id: string;
  combination: string[];
  price: number;
  stock: number;
  image?: string;
}

interface VariantModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (categories: VariantCategory[], variants: Variant[]) => void;
  initialCategories?: VariantCategory[];
  initialVariants?: Variant[];
  basePrice: number;
}

const VariantModal: React.FC<VariantModalProps> = ({
  visible,
  onClose,
  onSave,
  initialCategories = [],
  initialVariants = [],
  basePrice,
}) => {
  const { 
    step, setStep, categories, setCategories,
    variants, setVariants, currentCategoryName, setCurrentCategoryName,
    currentCategoryValues, setCurrentCategoryValues,
    editingCategoryId, setEditingCategoryId,
    editingVariantId, setEditingVariantId, editPrice, setEditPrice,
    editStock, setEditStock, handleSaveCategory, removeCategory, generateCombinations,
    editCategory, handleGenerateVariants, updateVariant, deleteVariant,
    startEditingVariant, saveEditingVariant, cancelEditingVariant,
    pickVariantImage, removeVariantImage, handleSave, showCustomVariant, setShowCustomVariant,
    selectedCategoryValues, setSelectedCategoryValues, handleAddCustomVariant, handleCategoryValueSelect,
 
    selectedVariantIds, isSelectionMode, toggleVariantSelection,
    selectAllVariants, deselectAllVariants, toggleSelectionMode, deleteSelectedVariants
  } = useVariant();

  useEffect(() => {
    if (visible) {
      setCategories(initialCategories);
      setVariants(initialVariants);
      setStep(initialCategories.length > 0 ? 2 : 1);
      setSelectedCategoryValues({});
    }
  }, [visible, initialCategories, initialVariants]);

  const renderCategorySetup = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Variant Categories
        </Text>
        <Text className="text-sm text-gray-600 mb-6">
          Add categories like Color, Size, Material, etc.
        </Text>

        {categories.map((category) => (
          <View
            key={category.id}
            className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {category.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {category.values.join(', ')}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => editCategory(category)}
                  className="bg-blue-500 rounded-lg px-3 py-1.5"
                >
                  <Text className="text-white text-xs font-semibold">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeCategory(category.id)}
                  className="bg-red-500 rounded-lg p-1.5"
                >
                  <Trash2 size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {categories.length < 3 ? (
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-3">
              {editingCategoryId ? 'Edit Category' : 'Add New Category'}
            </Text>
            
            <Text className="text-xs text-gray-600 mb-2">Category Name</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 text-sm border border-gray-200 mb-4"
              placeholder="e.g., Color, Size, Material"
              value={currentCategoryName}
              onChangeText={setCurrentCategoryName}
              placeholderTextColor="#9CA3AF"
            />

            <Text className="text-xs text-gray-600 mb-2">
              Values (comma-separated)
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 text-sm border border-gray-200 mb-4"
              placeholder="e.g., Red, Blue, Green"
              value={currentCategoryValues}
              onChangeText={setCurrentCategoryValues}
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <TouchableOpacity
              onPress={handleSaveCategory}
              className="bg-pink-500 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold text-sm">
                {editingCategoryId ? 'Update Category' : 'Add Category'}
              </Text>
            </TouchableOpacity>

            {editingCategoryId && (
              <TouchableOpacity
                onPress={() => {
                  setCurrentCategoryName('');
                  setCurrentCategoryValues('');
                  setEditingCategoryId(null);
                }}
                className="mt-2 py-2 items-center"
              >
                <Text className="text-gray-600 text-sm">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {categories.length > 0 && (
          <TouchableOpacity
            onPress={() => variants.length > 0 ? setStep(2) : handleGenerateVariants(basePrice)}
            className={`${variants.length > 0 ? 'bg-pink-500' : 'bg-green-500'} rounded-xl py-4 items-center mb-4`}
          >
            <Text className="text-white font-bold text-base">
              {variants.length > 0 ? 'Edit Variants' : `Generate Variants (${generateCombinations(categories).length})`} 
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderCustomVariantForm = () => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">Add Custom Variant</Text>
        <TouchableOpacity
          onPress={() => {
            setShowCustomVariant(false);
            setSelectedCategoryValues({});
          }}
          className="p-1"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-gray-600 mb-4">
        Select options to create a custom variant combination
      </Text>

      {categories.map((category) => (
        <View key={category.id} className="mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            {category.name}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {category.values.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleCategoryValueSelect(category.id, value)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedCategoryValues[category.id] === value
                    ? 'bg-pink-500 border-pink-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategoryValues[category.id] === value
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {Object.values(selectedCategoryValues).filter(value => value).length > 0 && (
        <View className="bg-gray-50 rounded-lg p-3 mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-1">
            Selected Combination:
          </Text>
          <Text className="text-sm text-gray-600">
            {categories
              .map(category => selectedCategoryValues[category.id])
              .filter(value => value)
              .join(' • ')}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => handleAddCustomVariant(basePrice)}
        className={`rounded-lg py-3 items-center ${
          categories.every(category => selectedCategoryValues[category.id])
            ? 'bg-pink-500'
            : 'bg-gray-300'
        }`}
        disabled={!categories.every(category => selectedCategoryValues[category.id])}
      >
        <Text className={`font-semibold text-sm ${
          categories.every(category => selectedCategoryValues[category.id])
            ? 'text-white'
            : 'text-gray-500'
        }`}>
          Add Custom Variant
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVariantTable = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Variant Details
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setStep(1)}
            className="bg-gray-200 rounded-lg px-4 py-2"
          >
            <Text className="text-gray-700 font-semibold text-xs">
              Edit Categories
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setShowCustomVariant(!showCustomVariant)}
          className="bg-blue-500 rounded-xl py-3 px-4 items-center flex-row justify-center mb-4"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold text-sm ml-2">
            {showCustomVariant ? 'Cancel Custom Variant' : 'Add Custom Variant'}
          </Text>
        </TouchableOpacity>

        {showCustomVariant && renderCustomVariantForm()}

        {/* Bulk Selection Controls */}
        {variants.length > 0 && (
          <View className="mb-4 gap-2">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={toggleSelectionMode}
                className={`flex-1 ${isSelectionMode ? 'bg-gray-500' : 'bg-purple-500'} rounded-lg py-3 px-4 items-center flex-row justify-center`}
              >
                {isSelectionMode ? (
                  <CheckSquare size={20} color="white" />
                ) : (
                  <Square size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-sm ml-2">
                  {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
                </Text>
              </TouchableOpacity>

              {isSelectionMode && (
                <TouchableOpacity
                  onPress={selectedVariantIds.size === variants.length ? deselectAllVariants : selectAllVariants}
                  className="bg-blue-500 rounded-lg py-3 px-4 items-center justify-center"
                >
                  <Text className="text-white font-semibold text-sm">
                    {selectedVariantIds.size === variants.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isSelectionMode && selectedVariantIds.size > 0 && (
              <TouchableOpacity
                onPress={deleteSelectedVariants}
                className="bg-red-500 rounded-lg py-3 px-4 items-center flex-row justify-center"
              >
                <Trash2 size={20} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">
                  Delete Selected ({selectedVariantIds.size})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {variants.length > 0 && !isSelectionMode && (
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete All Variants',
                  'Are you sure you want to delete all variants? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete All',
                      style: 'destructive',
                      onPress: () => setVariants([]),
                    },
                  ]
                );
              }}
              className="bg-red-500 rounded-lg py-4 px-4 items-center flex-row justify-center"
            >
              <Trash2 size={16} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">
                Delete All Variants
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {variants.length > 0 && (
          <View className="bg-gray-100 rounded-lg p-4 mb-2 flex-row border border-gray-200">
            {isSelectionMode && (
              <View className="w-12 ">
                <Text className="text-xs font-bold text-gray-700  uppercase text-center">Select</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xs font-bold text-gray-700 uppercase">Variant</Text>
            </View>
            <View className="w-20">
              <Text className="text-xs font-bold text-gray-700 uppercase text-center">Image</Text>
            </View>
            <View className="w-24">
              <Text className="text-xs font-bold text-gray-700 uppercase text-center">Price (₱)</Text>
            </View>
            <View className="w-20">
              <Text className="text-xs font-bold text-gray-700 uppercase text-center">Stock</Text>
            </View>
            {!isSelectionMode && (
              <View className="w-20">
                <Text className="text-xs font-bold text-gray-700 uppercase text-center">Actions</Text>
              </View>
            )}
          </View>
        )}

        {variants.length > 0 ? (
          variants.map((variant, index) => (
            <View
              key={variant.id}
              className={`bg-white rounded-lg p-4 mb-2 border ${
                selectedVariantIds.has(variant.id) ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
              } flex-row items-center`}
            >
              {isSelectionMode && (
                <TouchableOpacity
                  onPress={() => toggleVariantSelection(variant.id)}
                  className="w-10 items-center justify-center"
                >
                  {selectedVariantIds.has(variant.id) ? (
                    <CheckSquare size={24} color="#EC4899" />
                  ) : (
                    <Square size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              )}

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  {variant.combination.join(' • ')}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Variant {index + 1}
                </Text>
              </View>

              <View className="w-20 items-center">
                {variant.image ? (
                  <TouchableOpacity
                    onPress={() => !isSelectionMode && pickVariantImage(variant.id)}
                    className="relative"
                    disabled={isSelectionMode}
                  >
                    <Image
                      source={{ uri: variant.image }}
                      className="w-12 h-12 rounded-lg"
                      resizeMode="cover"
                    />
                    {!isSelectionMode && (
                      <TouchableOpacity
                        onPress={() => removeVariantImage(variant.id)}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                      >
                        <XIcon size={10} color="white" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => pickVariantImage(variant.id)}
                    className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center"
                    disabled={isSelectionMode}
                  >
                    <Upload size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              <View className="w-24 items-center">
                {editingVariantId === variant.id && !isSelectionMode ? (
                  <TextInput
                    className="bg-gray-50 rounded-lg px-2 py-1 text-gray-900 text-sm border border-gray-200 text-center w-20"
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                ) : (
                  <Text className="text-sm font-medium text-gray-900 text-center">
                    ₱{variant.price.toFixed(2)}
                  </Text>
                )}
              </View>

              <View className="w-20 items-center">
                {editingVariantId === variant.id && !isSelectionMode ? (
                  <TextInput
                    className="bg-gray-50 rounded-lg px-2 py-1 text-gray-900 text-sm border border-gray-200 text-center w-16"
                    value={editStock}
                    onChangeText={setEditStock}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                ) : (
                  <Text className="text-sm font-medium text-gray-900 text-center">
                    {variant.stock}
                  </Text>
                )}
              </View>

              {!isSelectionMode && (
                <View className="w-20 items-center">
                  {editingVariantId === variant.id ? (
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={saveEditingVariant}
                        className="bg-green-500 rounded p-1"
                      >
                        <Check size={14} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditingVariant}
                        className="bg-red-500 rounded p-1"
                      >
                        <XIcon size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={() => startEditingVariant(variant)}
                        className="bg-blue-500 rounded p-1.5"
                      >
                        <Edit3 size={14} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteVariant(variant.id)}
                        className="bg-red-500 rounded p-1.5"
                      >
                        <Trash2 size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="bg-gray-50 rounded-lg p-8 items-center justify-center border border-dashed border-gray-300">
            <Text className="text-gray-500 text-lg font-medium mb-2">
              No Variants Generated
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Generate variants from your categories or add custom variants
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowCustomVariant(true)}
                className="bg-white border border-pink-500 rounded-lg px-6 py-3"
              >
                <Text className="text-pink-500 font-semibold text-sm">
                  Add Custom
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleGenerateVariants(basePrice)}
                className="bg-pink-500 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold text-sm">
                  Generate All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {variants.length > 0 && (
          <View className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Summary
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Variants:</Text>
              <Text className="text-sm font-medium text-gray-900">{variants.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Stock:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {variants.reduce((sum, variant) => sum + variant.stock, 0)}
              </Text>
            </View>
            {isSelectionMode && selectedVariantIds.size > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Selected:</Text>
                <Text className="text-sm font-medium text-pink-600">{selectedVariantIds.size}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6 flex-row items-center justify-between shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">
            Product Variants
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-200"
          >
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {step === 1 ? renderCategorySetup() : renderVariantTable()}

        {step === 2 && (
          <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
            <TouchableOpacity
              onPress={() => handleSave(onSave, onClose)}
              className="bg-pink-500 rounded-xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">
                Save Variants
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default VariantModal;