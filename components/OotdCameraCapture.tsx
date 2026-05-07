import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

type CameraInstance = React.ElementRef<typeof CameraView>;

type Props = {
  open: boolean;
  onClose: () => void;
  onPhotoCaptured: (uri: string) => void;
};

export default function OotdCameraCapture({
  open,
  onClose,
  onPhotoCaptured,
}: Props) {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  const cameraRef = React.useRef<CameraInstance>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = React.useState<CameraType>('back');
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const [allowCameraRender, setAllowCameraRender] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setAllowCameraRender(false);
      setFacing('back');
      setCameraError(null);
      setIsCameraReady(false);
      return;
    }

    let cancelled = false;

    (async () => {
      if (!cameraPermission || !cameraPermission.granted) {
        const result = await requestCameraPermission();
        if (!result?.granted) {
          Alert.alert(
            'Camera permission required',
            'Please allow camera access to take photos.'
          );
          if (!cancelled) {
            onCloseRef.current();
          }
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!cancelled) {
        setIsCameraReady(false);
        setCameraError(null);
        setAllowCameraRender(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, cameraPermission, requestCameraPermission]);

  const takePicture = async (camera: CameraInstance | null) => {
    if (!camera) {
      Alert.alert('Camera Error', 'Camera is not available');
      return;
    }
    if (!isCameraReady) {
      Alert.alert(
        'Camera Not Ready',
        'Please wait for the camera to initialize'
      );
      return;
    }

    try {
      const photo = await camera.takePictureAsync({
        quality: 1,
        base64: false,
      });
      onPhotoCaptured(photo.uri);
      onClose();
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'Failed to take picture. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.cameraContainer}>
        <StatusBar style="light" />
        {allowCameraRender ? (
          <View style={styles.cameraWrapper}>
            <CameraView
              key={facing}
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
              onCameraReady={() => {
                setIsCameraReady(true);
                setCameraError(null);
              }}
              onMountError={(error) => {
                console.error('Camera mount error', error);
                setCameraError(error?.message ?? 'Unable to open camera.');
                Alert.alert(
                  'Camera Error',
                  error?.message ?? 'Unable to open camera.'
                );
                onCloseRef.current();
                setIsCameraReady(false);
              }}
            />
            {!isCameraReady && !cameraError && (
              <View style={styles.cameraLoadingOverlay}>
                <Text style={styles.cameraLoadingText}>
                  Initializing camera...
                </Text>
              </View>
            )}
            {cameraError && (
              <View style={styles.cameraError}>
                <Text style={styles.cameraErrorText}>{cameraError}</Text>
              </View>
            )}
            <View style={styles.cameraControls}>
              <View style={[styles.controlsCluster, styles.controlsClusterLeft]}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => {
                    onClose();
                    setIsCameraReady(false);
                  }}
                >
                  <Text style={styles.cameraButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.captureButton}
                disabled={!isCameraReady}
                onPress={() => {
                  if (cameraRef.current) {
                    void takePicture(cameraRef.current);
                  }
                }}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={[styles.controlsCluster, styles.controlsClusterRight]}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.cameraButtonText}>Flip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.cameraLoading}>
            <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoading: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraErrorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  controlsCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlsClusterLeft: {
    justifyContent: 'flex-start',
  },
  controlsClusterRight: {
    justifyContent: 'flex-end',
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cameraButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});
