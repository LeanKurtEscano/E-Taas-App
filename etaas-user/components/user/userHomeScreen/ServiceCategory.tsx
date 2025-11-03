 
 
import { serviceCategories } from "@/constants/userHomeScreen";
import { TouchableOpacity } from "react-native";
import { Image,View,Text } from "react-native";
import { useHomeStore } from "@/store/useHomeStore";
import { router } from "expo-router";
export const ServiceCategory = ({ item }: { item: typeof serviceCategories[0] }) => {
    const IconComponent = item.icon;
    const { setServiceCategory } = useHomeStore();

    const handlePress = () => {
        setServiceCategory(item.name);
        router.push('/services');
      };
        
    
    return (
      <TouchableOpacity 
      onPress={handlePress}
        className="bg-white border border-gray-300 rounded-3xl mr-3 overflow-hidden active:opacity-80"
        style={{ 
          width: 130, 
          height: 150,
         
          elevation: 5,
        }}
      >
        <Image
          source={{ uri: item.image }}
          className="w-full h-20"
          resizeMode="cover"
        />
        <View className="flex-1 items-center justify-center p-3 bg-white">
          <View className="w-11 h-11 bg-pink-50 rounded-2xl items-center justify-center mb-2">
            <IconComponent size={22} color="#ec4899" strokeWidth={2.5} />
          </View>
          <Text className="text-gray-800 font-bold text-center text-xs leading-4">
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };