import {createApiClient} from "@/config/apiClient";
import {createApi} from "@/config/axiosInstance";

const IP_URL = process.env.EXPO_PUBLIC_IP_URL;

export const authApiClient = createApiClient(createApi(`${IP_URL}/v1/api/auth`));