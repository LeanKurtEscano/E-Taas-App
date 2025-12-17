import * as SecureStore from "expo-secure-store";

export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("etaas_access_token");
};