import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  placeholder?: string;
  onChangeText: (text: string) => void;
  value: string;
}

export const SearchBar = ({ placeholder = "Search products...", onChangeText, value }: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3.5">
      <Search size={20} color="#9CA3AF" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-3 text-gray-900 text-base"
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
};
