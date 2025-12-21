import { sellerApiClient } from "@/config/seller/seller";
import { authorizeApiClient } from "@/config/general/auth";
import { userApiClient } from "@/config/user/user";

export const switchToRole = async (

  setSwitching : (switching: boolean) => void,
  isSellerMode: boolean,
  mapUserFromBackend: (userData: any) => void
) => {

  try {
    setSwitching(true);
    const response = await sellerApiClient.put('/switch-role', {is_seller_mode: isSellerMode});
    const fetchUserDetails = await userApiClient.get('/user-details');

    console.log('Role switch response:', fetchUserDetails.data);
    mapUserFromBackend(fetchUserDetails.data.user);
  } catch (error) {
   
  } finally {
    setSwitching(false);
  }
};
