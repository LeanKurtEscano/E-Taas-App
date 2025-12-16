// hooks/useAddress.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { AddressForm, Coordinates } from '@/types/user/address';

interface UseAddressReturn {
  coordinates: Coordinates | null;
  setCoordinates: (coords: Coordinates | null) => void;
  tempCoordinates: Coordinates | null;
  setTempCoordinates: (coords: Coordinates | null) => void;
  loadingLocation: boolean;
  loadingAddress: boolean;
  locationError: string | null;
  setLocationError: (error: string | null) => void;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setMapRegion: (region: any) => void;
  reverseGeocode: (latitude: number, longitude: number, isTemp?: boolean) => Promise<void>;
  checkLocationServices: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  handleUseCurrentLocation: () => Promise<void>;
  handleMapDragEnd: (e: any) => Promise<void>;
}

interface UseAddressProps {
  form: AddressForm;
  updateForm: (field: keyof AddressForm, value: string | boolean) => void;
  setTempForm: (form: AddressForm | null) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const useLocation = ({
  form,
  updateForm,
  setTempForm,
  showToast,
}: UseAddressProps): UseAddressReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [tempCoordinates, setTempCoordinates] = useState<Coordinates | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const reverseGeocode = async (
    latitude: number,
    longitude: number,
    isTemp: boolean = false
  ) => {
    try {
      setLoadingAddress(true);
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        const addressData = {
          region: address.region || '',
          province: address.region || '',
          city: address.city || '',
          barangay: address.district || address.street || '',
          streetAddress: address.name || address.street || '',
        };

        if (isTemp) {
          setTempForm({
            ...form,
            ...addressData,
          });
        } else {
          updateForm('region', addressData.region);
          updateForm('province', addressData.province);
          updateForm('city', addressData.city);
          updateForm('barangay', addressData.barangay);
          updateForm('streetAddress', addressData.streetAddress);
        }
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      showToast('Failed to fetch address details', 'error');
    } finally {
      setLoadingAddress(false);
    }
  };

  const checkLocationServices = async (): Promise<boolean> => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // On Android, this will prompt user to enable location
                Location.enableNetworkProviderAsync();
              },
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Check location services error:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'ETAAS needs location permission to help you set your delivery address. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK' },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Request permission error:', error);
      showToast('Failed to request location permission', 'error');
      return false;
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      // Check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        return;
      }

      // Request permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      // Get current location with timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 second timeout
        maximumAge: 10000,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Location request timeout')), 15000)
      );

      const location: any = await Promise.race([
        locationPromise,
        timeoutPromise,
      ]);

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Validate coordinates
      if (
        !coords.latitude ||
        !coords.longitude ||
        coords.latitude < -90 ||
        coords.latitude > 90 ||
        coords.longitude < -180 ||
        coords.longitude > 180
      ) {
        throw new Error('Invalid coordinates received');
      }

      setTempCoordinates(coords);
      setMapRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      await reverseGeocode(coords.latitude, coords.longitude, true);
      showToast('Location loaded successfully', 'success');
    } catch (error: any) {
      console.error('Location error:', error);

      let errorMessage = 'Failed to get your current location';

      if (error.message === 'Location request timeout') {
        errorMessage =
          'Location request timed out. Please try again or enter address manually.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage =
          'Location is currently unavailable. Please check your GPS settings.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (error.code === 'E_LOCATION_SETTINGS_UNSATISFIED') {
        errorMessage = 'Please enable high accuracy location mode in settings.';
      }

      setLocationError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapDragEnd = async (e: any) => {
    try {
      const { latitude, longitude } = e.nativeEvent.coordinate;

      // Validate coordinates
      if (!latitude || !longitude) {
        showToast('Invalid location selected', 'error');
        return;
      }

      setTempCoordinates({ latitude, longitude });
      await reverseGeocode(latitude, longitude, true);
    } catch (error) {
      console.error('Map drag error:', error);
      showToast('Failed to update location', 'error');
    }
  };

  return {
    coordinates,
    setCoordinates,
    tempCoordinates,
    setTempCoordinates,
    loadingLocation,
    loadingAddress,
    locationError,
    setLocationError,
    mapRegion,
    setMapRegion,
    reverseGeocode,
    checkLocationServices,
    requestLocationPermission,
    handleUseCurrentLocation,
    handleMapDragEnd,
  };
};