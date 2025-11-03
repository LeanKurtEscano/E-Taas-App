import { Store, Package, TrendingUp, DollarSign, Users, BarChart3, Settings, HelpCircle, LogOut, ChevronRight, RefreshCw } from 'lucide-react-native';

interface SellerOption {
    id: number;
    title: string;
    icon: any;
    route?: string;
}


export const sellerOptions: SellerOption[] = [
    { 
        id: 1, 
        title: 'My Products', 
        icon: Package,
        route: '/products' 
    },
    { 
        id: 2, 
        title: 'Orders Management', 
        icon: Store,
        route: '/seller/orders' 
    },
    { 
        id: 3, 
        title: 'Sales Analytics', 
        icon: TrendingUp,
        route: '/(tabs)' 
    },
    { 
        id: 4, 
        title: 'Revenue Report', 
        icon: DollarSign,
        route: '/seller/revenue' 
    },
    { 
        id: 5, 
        title: 'Customer Reviews', 
        icon: Users,
        route: '/seller/reviews' 
    },
    { 
        id: 6, 
        title: 'Shop Statistics', 
        icon: BarChart3,
        route: '/seller/statistics' 
    },
    { 
        id: 7, 
        title: 'Seller Settings', 
        icon: Settings,
        route: '/seller/settings' 
    },
    { 
        id: 8, 
        title: 'Help & Support', 
        icon: HelpCircle,
        route: '/seller/support' 
    },
];