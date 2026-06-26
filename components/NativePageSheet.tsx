import React from 'react';
import { Modal, SafeAreaView, StyleSheet, type ModalProps } from 'react-native';

type NativePageSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  animationType?: ModalProps['animationType'];
};

export default function NativePageSheet({
  visible,
  onClose,
  children,
  backgroundColor = '#1c1c1e',
  animationType = 'slide',
}: NativePageSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>{children}</SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
