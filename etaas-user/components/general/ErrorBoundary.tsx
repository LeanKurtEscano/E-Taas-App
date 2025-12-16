// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-gray-50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 items-center shadow-sm w-full max-w-sm">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
              Something went wrong
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-4">
              An unexpected error occurred. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text className="text-xs text-gray-500 text-center mb-4 p-2 bg-gray-100 rounded">
                {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-pink-500 py-3 px-6 rounded-lg w-full"
            >
              <Text className="text-white font-semibold text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}