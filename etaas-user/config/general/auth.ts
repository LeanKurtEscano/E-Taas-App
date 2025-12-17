import {createApiClient} from "@/config/apiClient";
import {createApi} from "@/config/axiosInstance";
import { getAccessToken } from "@/utils/general/token";
const IP_URL = process.env.EXPO_PUBLIC_IP_URL;

export const authApiClient = createApiClient(createApi(`${IP_URL}/v1/api/auth`));
export const authorizeApiClient = createApiClient(createApi(`${IP_URL}/v1/api/auth`,getAccessToken));