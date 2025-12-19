import { authorizeApiClient } from "@/config/general/auth";

export const switchToRole = async (

  setSwitching : (switching: boolean) => void,
  isSellerMode: boolean
) => {
  try {
    setSwitching(true);
    // const response = await authorizeApiClient.post('/switch-role', {isSellerMode: isSellerMode});
   
  } catch (error) {
   
  } finally {
    setSwitching(false);
  }
};
