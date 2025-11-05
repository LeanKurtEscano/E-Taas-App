import { useState, useEffect } from 'react';

interface Product {
  name: string;
  price: number;
  quantity: number;
  hasVariants: boolean;
  category: string;
  variants?: Array<{
    id: string;
    combination: string[];
    price: number;
    stock: number;
  }>;
  variantCategories?: Array<{
    name: string;
    values: string[];
  }>;
}

interface OrderItem {
  productId: string;
  variantId: string | null;
  variantText: string;
  quantity: number;
  price: number;
}

interface Order {
  createdAt: any;
  items: OrderItem[];
  status: string;
  totalAmount: number;
}

interface VariantAnalytics {
  variantId: string;
  combination: string;
  price: number;
  stock: number;
  unitsSold: number;
  revenue: number;
}

interface SalesByDate {
  date: string;
  revenue: number;
  units: number;
}

interface AnalyticsData {
  loading: boolean;
  error: string | null;
  product: Product | null;
  totalRevenue: number;
  totalUnitsSold: number;
  totalOrders: number;
  totalStock: number;
  bestSellingVariant: string;
  averageOrderValue: number;
  variantAnalytics: VariantAnalytics[];
  salesByDate: SalesByDate[];
}

export const useProductAnalytics = (productId: string): AnalyticsData => {
  const [data, setData] = useState<AnalyticsData>({
    loading: true,
    error: null,
    product: null,
    totalRevenue: 0,
    totalUnitsSold: 0,
    totalOrders: 0,
    totalStock: 0,
    bestSellingVariant: 'N/A',
    averageOrderValue: 0,
    variantAnalytics: [],
    salesByDate: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Simulated Firebase fetch - replace with actual Firebase calls
        const product = await fetchProduct(productId);
        const orders = await fetchOrders(productId);

        if (!product) {
          setData(prev => ({ ...prev, loading: false, error: 'Product not found' }));
          return;
        }

        // Filter completed orders
        const completedOrders = orders.filter(
          order => order.status === 'completed' || order.status === 'delivered'
        );

        // Calculate analytics
        let totalRevenue = 0;
        let totalUnitsSold = 0;
        const variantSales = new Map<string, { units: number; revenue: number; variantData: any }>();
        const salesByDateMap = new Map<string, { revenue: number; units: number }>();

        completedOrders.forEach(order => {
          const orderItems = order.items.filter(item => item.productId === productId);
          
          orderItems.forEach(item => {
            const itemRevenue = item.price * item.quantity;
            totalRevenue += itemRevenue;
            totalUnitsSold += item.quantity;

            // Track sales by date
            const date = new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString();
            const dateData = salesByDateMap.get(date) || { revenue: 0, units: 0 };
            dateData.revenue += itemRevenue;
            dateData.units += item.quantity;
            salesByDateMap.set(date, dateData);

            // Track variant sales
            if (product.hasVariants && item.variantId) {
              const variantData = variantSales.get(item.variantId) || { 
                units: 0, 
                revenue: 0,
                variantData: product.variants?.find(v => v.id === item.variantId)
              };
              variantData.units += item.quantity;
              variantData.revenue += itemRevenue;
              variantSales.set(item.variantId, variantData);
            }
          });
        });

        // Calculate total stock
        let totalStock = 0;
        if (product.hasVariants && product.variants) {
          totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        } else {
          totalStock = product.quantity;
        }

        // Build variant analytics
        const variantAnalytics: VariantAnalytics[] = [];
        if (product.hasVariants && product.variants) {
          product.variants.forEach(variant => {
            const sales = variantSales.get(variant.id) || { units: 0, revenue: 0 };
            variantAnalytics.push({
              variantId: variant.id,
              combination: variant.combination.join(', '),
              price: variant.price,
              stock: variant.stock,
              unitsSold: sales.units,
              revenue: sales.revenue,
            });
          });
        }

        // Find best selling variant
        let bestSellingVariant = 'N/A';
        if (variantAnalytics.length > 0) {
          const best = variantAnalytics.reduce((max, curr) => 
            curr.unitsSold > max.unitsSold ? curr : max
          );
          bestSellingVariant = best.combination;
        }

        // Convert sales by date to array and sort
        const salesByDate = Array.from(salesByDateMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const averageOrderValue = completedOrders.length > 0 
          ? totalRevenue / completedOrders.length 
          : 0;

        setData({
          loading: false,
          error: null,
          product,
          totalRevenue,
          totalUnitsSold,
          totalOrders: completedOrders.length,
          totalStock,
          bestSellingVariant,
          averageOrderValue,
          variantAnalytics,
          salesByDate,
        });
      } catch (err) {
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Failed to fetch analytics' 
        }));
      }
    };

    fetchAnalytics();
  }, [productId]);

  return data;
};

// Mock Firebase functions - replace with actual Firebase calls
const fetchProduct = async (productId: string): Promise<Product | null> => {
  // Replace with: const docRef = doc(db, 'products', productId);
  // const docSnap = await getDoc(docRef);
  // return docSnap.exists() ? docSnap.data() as Product : null;
  
  return {
    name: 'Shampoo',
    price: 150,
    quantity: 0,
    hasVariants: true,
    category: 'Home',
    variantCategories: [
      { name: 'Size', values: ['S', 'M', 'L'] },
      { name: 'Ingredients', values: ['Coconut', 'Aloe Vera', 'Sunsilk'] }
    ],
    variants: [
      { id: 'var1', combination: ['S', 'Aloe Vera'], price: 140, stock: 3 },
      { id: 'var2', combination: ['M', 'Coconut'], price: 155, stock: 19 },
      { id: 'var3', combination: ['L', 'Sunsilk'], price: 125, stock: 4 },
    ]
  };
};

const fetchOrders = async (productId: string): Promise<Order[]> => {
  // Replace with: const q = query(collection(db, 'orders'), 
  //   where('items', 'array-contains', { productId }));
  // const querySnapshot = await getDocs(q);
  // return querySnapshot.docs.map(doc => doc.data() as Order);
  
  return [
    {
      createdAt: { seconds: new Date('2025-11-01').getTime() / 1000 },
      status: 'completed',
      totalAmount: 420,
      items: [
        { productId, variantId: 'var1', variantText: 'S, Aloe Vera', quantity: 3, price: 140 }
      ]
    },
    {
      createdAt: { seconds: new Date('2025-11-02').getTime() / 1000 },
      status: 'completed',
      totalAmount: 310,
      items: [
        { productId, variantId: 'var2', variantText: 'M, Coconut', quantity: 2, price: 155 }
      ]
    },
    {
      createdAt: { seconds: new Date('2025-11-03').getTime() / 1000 },
      status: 'completed',
      totalAmount: 375,
      items: [
        { productId, variantId: 'var3', variantText: 'L, Sunsilk', quantity: 3, price: 125 }
      ]
    },
  ];
};