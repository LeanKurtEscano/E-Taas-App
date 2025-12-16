
export interface Address {
    id: string;
    fullName: string;
    phoneNumber: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    streetAddress: string;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}


export interface AddressForm {
  fullName: string;
  phoneNumber: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  streetAddress: string;
  isDefault: boolean;
}


export interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  province?: string;
  city?: string;
  barangay?: string;
  streetAddress?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserAddress extends AddressForm {
  id: string;
  coordinates?: Coordinates | null;
  createdAt: string;
  updatedAt: string;
}

