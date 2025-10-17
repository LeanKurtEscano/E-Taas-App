import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity 
      className="absolute bottom-6 right-6 bg-pink-500 w-14 h-14 rounded-full items-center justify-center"
      onPress={onPress}
      style={{
        shadowColor: '#E91E8C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Plus size={28} color="white" />
    </TouchableOpacity>
  );
};