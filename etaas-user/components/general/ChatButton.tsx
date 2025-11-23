import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface ChatButtonProps {
  onPress: () => void;
  buttonSize?: number;
  icon?: string;
  bottomOffset?: number;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  onPress,
  buttonSize = 56,
  icon = '💬',
  bottomOffset = 120,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    glow.start();
    pulse.start();

    return () => {
      glow.stop();
      pulse.stop();
    };
  }, [glowAnim, pulseAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <>
      {/* Outer glow layer */}
      <Animated.View
        style={[
          styles.glowOuter,
          {
            width: buttonSize + 20,
            height: buttonSize + 20,
            borderRadius: (buttonSize + 20) / 2,
            bottom: bottomOffset - 10,
            opacity: glowOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      
      {/* Inner glow layer */}
      <Animated.View
        style={[
          styles.glowInner,
          {
            width: buttonSize + 10,
            height: buttonSize + 10,
            borderRadius: (buttonSize + 10) / 2,
            bottom: bottomOffset - 5,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        className="absolute right-5 bg-pink-500 rounded-full items-center justify-center z-50"
        style={{
          width: buttonSize,
          height: buttonSize,
          bottom: bottomOffset,
          shadowColor: '#ec4899',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text className="text-2xl">{icon}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  glowOuter: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#ec4899',
    zIndex: 48,
  },
  glowInner: {
    position: 'absolute',
    right: 15,
    backgroundColor: '#ec4899',
    zIndex: 49,
  },
});

export default ChatButton;