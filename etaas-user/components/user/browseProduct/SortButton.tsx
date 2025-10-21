// components/SortButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Modal, Pressable } from 'react-native';

interface SortButtonProps {
  sortBy: 'latest' | 'price-low' | 'price-high';
  onSortChange: (sort: 'latest' | 'price-low' | 'price-high') => void;
}

const SortButton: React.FC<SortButtonProps> = ({ sortBy, onSortChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const handleSelect = (value: 'latest' | 'price-low' | 'price-high') => {
    onSortChange(value);
    setModalVisible(false);
  };

  const currentLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort';

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
      className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
        activeOpacity={0.7}
      >
        <Text className="text-sm font-semibold text-gray-700">Sort: {currentLabel}</Text>
        <Text className="text-gray-500">▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl">
            <View className="p-5">
              <Text className="text-lg font-bold text-gray-900 mb-4">Sort By</Text>
              
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value as any)}
                  className={`py-4 px-4 rounded-xl mb-2 ${
                    sortBy === option.value ? 'bg-pink-50' : 'bg-white'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-semibold ${
                      sortBy === option.value ? 'text-pink-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.value && ' ✓'}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-2 py-4 bg-gray-100 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-gray-700 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default SortButton;