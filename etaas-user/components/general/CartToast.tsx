import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, Dimensions } from 'react-native';

interface CartToastProps {
  visible: boolean;
  onHide: () => void;
  message: string;
}

const CartToast: React.FC<CartToastProps> = ({ visible, onHide, message }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const checkRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset check animations
      checkScaleAnim.setValue(0);
      checkRotateAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate checkmark after popup appears
        Animated.sequence([
          Animated.spring(checkScaleAnim, {
            toValue: 1.2,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(checkScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.timing(checkRotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });

      // Auto hide after 2 seconds
      const timer = setTimeout(() => {
        handleHide();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleHide}
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="bg-white rounded-2xl px-8 py-6 mx-8 shadow-lg"
        >
          <View className="bg-pink-500 rounded-full w-16 h-16 justify-center items-center mx-auto mb-4">
            <Animated.Text
              style={{
                transform: [
                  { scale: checkScaleAnim },
                  {
                    rotate: checkRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-180deg', '0deg'],
                    }),
                  },
                ],
              }}
              className="text-white text-3xl"
            >
              ✓
            </Animated.Text>
          </View>
          <Text className="text-pink-500 text-lg font-bold text-center">
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CartToast;