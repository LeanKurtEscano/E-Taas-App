import {createApiClient} from "@/config/apiClient";
import {createApi} from "@/config/axiosInstance";
import { getAccessToken } from "@/utils/general/token";

const IP_URL = process.env.EXPO_PUBLIC_IP_URL;

export const sellerApiClient = createApiClient(createApi(`${IP_URL}/v1/api/sellers`,getAccessToken));