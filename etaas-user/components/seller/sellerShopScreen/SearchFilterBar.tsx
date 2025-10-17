// components/SearchFilterBar.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, Filter, Grid, List, X } from 'lucide-react-native';
import { ViewMode } from '@/types/seller/shop';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onFilterPress,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View className="bg-white px-4 py-3 border-b border-gray-200">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mr-2">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-lg mr-2"
          onPress={onFilterPress}
        >
          <Filter size={20} color="#E91E8C" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-lg"
          onPress={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? (
            <List size={20} color="#E91E8C" />
          ) : (
            <Grid size={20} color="#E91E8C" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};