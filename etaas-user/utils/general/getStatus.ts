import { Order } from "@/types/order/sellerOrder";
import { CheckCircle, Clock, Package, PackageCheck, Truck, XCircle } from "lucide-react";
export const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };



  
export const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'shipped': return 'bicycle-outline';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };


