import { Store, Package, TrendingUp, DollarSign, Users, BarChart3, Settings, HelpCircle, LogOut, ChevronRight, RefreshCw, MessageSquare } from 'lucide-react-native';

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
        title: 'Customer Inquiries',
        icon: MessageSquare,
        route: '/seller/inquiries/all'
    },

    {
        id: 5,
        title: 'Revenue Report',
        icon: DollarSign,
        route: '/seller/revenue'
    },
    {
        id: 6,
        title: 'Customer Reviews',
        icon: Users,
        route: '/seller/reviews'
    },
    {
        id: 7,
        title: 'Shop Statistics',
        icon: BarChart3,
        route: '/seller/statistics'
    },
    {
        id: 8,
        title: 'Seller Settings',
        icon: Settings,
        route: '/seller/settings'
    },
    {
        id: 9,
        title: 'Help & Support',
        icon: HelpCircle,
        route: '/seller/support'
    },
];