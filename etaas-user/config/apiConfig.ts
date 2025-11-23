import {createApiClient} from "@/config/apiClient";
import {createApi} from "@/config/axiosInstance";

const IP_URL = process.env.EXPO_PUBLIC_IP_URL;

export const rawSellerApi = createApi(`${IP_URL}/api/v1/register`);
export const sellerApi = createApiClient(rawSellerApi);
export const rawIngestApi = createApi(`${IP_URL}/api/v1`);
export const ingestApi = createApiClient(rawIngestApi);
export const rawChatApi = createApi(`${IP_URL}/api/v1/chat`);
export const chatApi = createApiClient(rawChatApi);