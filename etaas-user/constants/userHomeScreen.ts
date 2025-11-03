
 import { 
  Package, 
  Shield, 

} from 'lucide-react-native';
import { ShoppingBag,  Truck, Wallet, Clock, HelpCircle, Settings, LogOut,  Store } from 'lucide-react-native';
import { 
  Shirt, 
  Watch, 
  Smartphone, 
  Home, 
  Coffee, 
  MoreHorizontal,
  Utensils,
  Plane,
  Heart,
  BookOpen,
  Sprout,

  RefreshCw,
  Award
} from 'lucide-react-native';

interface ProfileOption {
    id: number;
    title: string;
    icon: any;
    route: string;
}
// Product categories with image URLs
export const productCategories = [
  { 
    name: 'All', 
    icon: Package,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80'
  },
  { 
    name: 'Clothing', 
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80'
  },
  { 
    name: 'Accessories', 
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
  },
  { 
    name: 'Electronics', 
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'
  },
  { 
    name: 'Home', 
    icon: Home,
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&q=80'
  },
  { 
    name: 'Food & Beverages', 
    icon: Coffee,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80'
  },
  { 
    name: 'Others', 
    icon: MoreHorizontal,
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80'
  },
];

// Service categories with Lucide icons and images
export const serviceCategories = [
  { 
    name: 'All', 
    icon: Package,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'
  },
  { 
    name: 'Food', 
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'
  },
  { 
    name: 'Travel & Tours', 
    icon: Plane,
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80'
  },
  { 
    name: 'Therapy', 
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80'
  },
  { 
    name: 'School Supplies', 
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80'
  },
  { 
    name: 'Agricultural', 
    icon: Sprout,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80'
  },
  { 
    name: 'Clothing', 
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80'
  },
  { 
    name: 'Others', 
    icon: MoreHorizontal,
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80'
  },
];

// Hero banner data
export const heroBanners = [
  {
    id: 1,
    title: 'Discover Quality Products',
    subtitle: 'Shop from local businesses in your area',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    type: 'products',
  },
  {
    id: 2,
    title: 'Find Local Services',
    subtitle: 'Connect with trusted businesses near you',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    type: 'services',
  },
];
// Featured products data
export const featuredProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: '$129.99',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  },
  {
    id: 2,
    name: 'Smart Watch Series 5',
    price: '$299.99',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  },
  {
    id: 3,
    name: 'Designer Sunglasses',
    price: '$89.99',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
  },
  {
    id: 4,
    name: 'Leather Backpack',
    price: '$159.99',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  },
];

// Why shop with us features
export const features = [
  {
    id: 1,
    icon: Truck,
    title: 'Fast Delivery',
    description: '2-3 day shipping',
    color: '#fff', // lighter pink (icon/text)
    bgColor: '#f472b6', // bg-pink-400
  },
  {
    id: 2,
    icon: Shield,
    title: 'Secure Payment',
    description: '100% protected',
    color: '#fff',
    bgColor: '#f472b6',
  },
  {
    id: 3,
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day policy',
    color: '#fff',
    bgColor: '#f472b6',
  },
  {
    id: 4,
    icon: Award,
    title: 'Best Quality',
    description: 'Premium products',
    color: '#fff',
    bgColor: '#f472b6',
  },
];



export const profileOptions: ProfileOption[] = [
        { id: 1, title: 'My Orders', icon: ShoppingBag,route:'/orders/order' },
        { id: 2, title: 'To Ship', icon: Package, route:'/orders/toship' },
        { id: 3, title: 'To Receive', icon: Truck ,route:'/orders/toreceive'},
       // { id: 4, title: 'To Pay', icon: Wallet,route:'/orders/to-pay' },
        { id: 4, title: 'My Purchase History', icon: Clock, route:'/orders/purchase-history' },
        { id: 5, title: 'Help & Support', icon: HelpCircle,route:'/support/help' },
        { id: 6, title: 'Settings', icon: Settings, route:'/settings' },
    ];