import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useProductStore } from '../../../store/useProductStore';
interface SearchBarProps {
  placeholder?: string;
 
}

export const SearchBar = ({ placeholder = "Search products..." }: SearchBarProps) => {
   const { searchQuery, setSearchQuery, fetchProducts } = useProductStore();


  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchProducts(); 
  };

  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3.5">
      <Search size={20} color="#9CA3AF" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-3 text-gray-900 text-base"
        onChangeText={handleSearch}
        value={searchQuery}
      />
    </View>
  );
};
