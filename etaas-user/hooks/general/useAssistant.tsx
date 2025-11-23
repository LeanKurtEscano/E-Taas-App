import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '@/config/apiConfig';

interface Message {
  id: number;
  user_id: string;
  shop_id: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at: string;
}

interface AssistantProps {
  userId: string;
  shopId: number;
}

interface UseAssistantReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (query: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const getErrorMessage = (err: any): string => {
  // Network/timeout errors
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Please check your network connection and try again.';
  }
  
  if (err.message === 'Network Error' || !err.response) {
    return 'Please check your network connection and try again.';
  }

  // Server errors (5xx)
  if (err.response?.status >= 500) {
    return 'Something went wrong. Please try again later.';
  }

  // Client errors (4xx)
  if (err.response?.status >= 400 && err.response?.status < 500) {
    return err.response?.data?.message || 'Unable to process your request.';
  }

  return 'Please check your network connection and try again.';
};

const useAssistant = ({ userId, shopId }: AssistantProps): UseAssistantReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatApi.get(`/shops/${shopId}/chat-history/${userId}`, {
        timeout: 15000, // 15 second timeout
      });
      setMessages(response.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [userId, shopId]);

  // Send message to assistant
  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSending(true);
    setError(null);

    // Optimistically add user message
    const userMessage: Message = {
      id: Date.now(),
      user_id: userId,
      shop_id: shopId,
      role: 'user',
      message: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatApi.post(
        `/shops/${shopId}/agentic-chat`,
        {
          user_id: userId,
          query: query,
        },
        {
          timeout: 60000, // 60 second timeout for streaming
        }
      );

      // Handle streaming response - response.data contains the full streamed text
      let assistantResponse = '';
      
      if (typeof response.data === 'string') {
        // Parse SSE format if it comes as string
        const lines = response.data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            assistantResponse += line.substring(6) + '\n';
          }
        }
      } else if (response.data.answer) {
        // If backend returns JSON with answer field
        assistantResponse = response.data.answer;
      } else {
        // Direct text response
        assistantResponse = response.data;
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        user_id: userId,
        shop_id: shopId,
        role: 'assistant',
        message: assistantResponse.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      setError(getErrorMessage(err));
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [userId, shopId]);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refreshHistory: fetchHistory,
  };
};

export default useAssistant;