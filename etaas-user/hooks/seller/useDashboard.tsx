import { useCurrentUser } from "@/hooks/useCurrentUser";
import { db } from "@/config/firebaseConfig";
import { collection, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { Order } from "@/types/order/sellerOrder";
import { InquiryData } from "../general/useInquiries";
interface Metrics {
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalInquiries: number;
}

export const useSellerDashboard = () => {
  const { userData } = useCurrentUser();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentInquiriesData, setRecentInquiries] = useState<InquiryData[]>([]);
  const [chartData, setChartData] = useState<{ day: string; revenue: number }[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalInquiries: 0
  });

  const fetchTotalOrders = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where("sellerId", "==", userData?.uid || ""));
    const ordersSnapshot = await getDocs(q);
    setMetrics(prev => ({ ...prev, totalOrders: ordersSnapshot.size }));
  }

  const fetchDeliveredOrders = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where("sellerId", "==", userData?.uid || ""), where("status", "==", "delivered"));
    const ordersSnapshot = await getDocs(q);
    setMetrics(prev => ({ ...prev, deliveredOrders: ordersSnapshot.size }));
  }

  const fetchTotalRevenue = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where("sellerId", "==", userData?.uid || ""), where("status", "==", "delivered"));
    const ordersSnapshot = await getDocs(q);
    const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
    setMetrics(prev => ({ ...prev, totalRevenue }));
  }

  const fetchTotalInquiries = async () => {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, where("serviceOwnerId", "==", userData?.uid || ""));
    const inquiriesSnapshot = await getDocs(q);
    setMetrics(prev => ({ ...prev, totalInquiries: inquiriesSnapshot.size }));
  }

  const fetchRecentOrders = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where("sellerId", "==", userData?.uid || ""), orderBy("createdAt", "desc"));
    const ordersSnapshot = await getDocs(q);

    const recentOrdersSnapshot: Order[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Order, 'id'>)
    }));
    const fourRecentOrders = recentOrdersSnapshot.slice(0, 4);

    setRecentOrders(fourRecentOrders);
  };

  const fetchRecentInquiries = async () => {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, where("serviceOwnerId", "==", userData?.uid || ""));
    const inquiriesSnapshot = await getDocs(q);

    const recentInquiriesSnapshot: InquiryData[] = inquiriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<InquiryData, 'id'>)
    }));
    const fourRecentInquiries = recentInquiriesSnapshot.slice(0, 4);

    setRecentInquiries(fourRecentInquiries);
  }

const fetchChartData = async () => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef, 
    where("sellerId", "==", userData?.uid || ""), 
    where("status", "==", "delivered")
  );
  const ordersSnapshot = await getDocs(q);

  // Get current week (Monday to Sunday)
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days to subtract to get to Monday
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  // Get Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);

  // Create array for Monday to Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });

  // Initialize revenue map for each day
  const revenueByDay = weekDays.map(date => ({
    day: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue, Wed, etc.
    date: date.toDateString(),
    revenue: 0
  }));

  // Process orders and sum revenue by day
  ordersSnapshot.docs.forEach(doc => {
    const orderData = doc.data();
    
    let orderDate;
    if (orderData.orderReceivedAt?.toDate) {
      orderDate = orderData.orderReceivedAt.toDate();
    } else if (orderData.orderReceivedAt) {
      orderDate = new Date(orderData.orderReceivedAt);
    }

    if (orderDate) {
      const orderDateString = orderDate.toDateString();
      
      // Find matching day in our week array
      const dayIndex = revenueByDay.findIndex(d => d.date === orderDateString);
      if (dayIndex !== -1) {
        revenueByDay[dayIndex].revenue += orderData.totalAmount || 0;
      }
    }
  });

  const formattedChartData = revenueByDay.map(({ day, revenue }) => ({ day, revenue }));
  setChartData(formattedChartData);
};

  useEffect(() => {
    if (userData?.uid) {
      fetchTotalOrders();
      fetchDeliveredOrders();
      fetchTotalRevenue();
      fetchTotalInquiries();
      fetchRecentOrders();
      fetchRecentInquiries();
      fetchChartData();
    }
  }, [userData]);

  return {
    userData,
    metrics,
    chartData,
    recentOrders,
    recentInquiriesData
  };
};