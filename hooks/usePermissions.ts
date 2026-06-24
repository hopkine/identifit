import { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'loading';

export interface PermissionState {
  camera: PermissionStatus;
  gallery: PermissionStatus;
}

export function usePermissions() {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('loading');
  const [galleryPermission, setGalleryPermission] = useState<PermissionStatus>('loading');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    void checkCameraPermission();
    void checkGalleryPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      setCameraPermission(
        status === 'granted' ? 'granted' :
        status === 'denied' ? 'denied' : 'undetermined'
      );
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setCameraPermission('denied');
    }
  };

  const checkGalleryPermission = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setGalleryPermission(
        status === 'granted' ? 'granted' : 
        status === 'denied' ? 'denied' : 'undetermined'
      );
    } catch (error) {
      console.error('Error checking gallery permission:', error);
      setGalleryPermission('denied');
    } finally {
      setIsInitialized(true);
    }
  };

  const requestCameraAccess = async (): Promise<boolean> => {
    try {
      setCameraPermission('loading');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const granted = status === 'granted';

      setCameraPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setCameraPermission('denied');
      return false;
    }
  };

  const requestGalleryAccess = async (): Promise<boolean> => {
    try {
      setGalleryPermission('loading');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setGalleryPermission(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting gallery permission:', error);
      setGalleryPermission('denied');
      return false;
    }
  };

  const requestBothPermissions = async (): Promise<{ camera: boolean; gallery: boolean }> => {
    const [cameraGranted, galleryGranted] = await Promise.all([
      requestCameraAccess(),
      requestGalleryAccess(),
    ]);

    return {
      camera: cameraGranted,
      gallery: galleryGranted,
    };
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
      Alert.alert(
        'Settings Unavailable',
        'Please manually open your device settings and enable permissions for this app.',
        [{ text: 'OK' }]
      );
    }
  };

  const getPermissionState = (): PermissionState => {
    return {
      camera: cameraPermission,
      gallery: galleryPermission,
    };
  };

  const hasAllPermissions = (): boolean => {
    const state = getPermissionState();
    return state.camera === 'granted' && state.gallery === 'granted';
  };

  const hasCameraPermission = (): boolean => {
    return getPermissionState().camera === 'granted';
  };

  const hasGalleryPermission = (): boolean => {
    return getPermissionState().gallery === 'granted';
  };

  return {
    // Permission states
    permissionState: getPermissionState(),
    isInitialized,
    
    // Permission checks
    hasAllPermissions,
    hasCameraPermission,
    hasGalleryPermission,
    
    // Permission requests
    requestCameraAccess,
    requestGalleryAccess,
    requestBothPermissions,
    
    // Settings
    openAppSettings,
    
    // Refresh permission status
    checkCameraPermission,
    checkGalleryPermission,
  };
}