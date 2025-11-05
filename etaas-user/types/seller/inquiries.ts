export interface Inquiry {
  id: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  serviceName: string;
}
