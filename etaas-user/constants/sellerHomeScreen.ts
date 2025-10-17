import { Store, Package, TrendingUp, DollarSign, Users, BarChart3, Settings, HelpCircle, LogOut, ChevronRight, RefreshCw } from 'lucide-react-native';

interface SellerOption {
    id: number;
    title: string;
    icon: any;
}
export const sellerOptions: SellerOption[] = [
        { id: 1, title: 'My Products', icon: Package },
        { id: 2, title: 'Orders Management', icon: Store },
        { id: 3, title: 'Sales Analytics', icon: TrendingUp },
        { id: 4, title: 'Revenue Report', icon: DollarSign },
        { id: 5, title: 'Customer Reviews', icon: Users },
        { id: 6, title: 'Shop Statistics', icon: BarChart3 },
        { id: 7, title: 'Seller Settings', icon: Settings },
        { id: 8, title: 'Help & Support', icon: HelpCircle },
    ];
