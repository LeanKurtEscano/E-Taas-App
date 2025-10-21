import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        selected 
          ? 'bg-pink-600 border-pink-600' 
          : 'bg-white border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-sm font-semibold ${
          selected ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default FilterChip;