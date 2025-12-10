import React, { useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Signature from "react-native-signature-canvas";

interface SignaturePadProps {
  onOK: (dataUrl: string) => void;
  onClear?: () => void;
  hasSignature?: boolean;
}

export default function SignaturePad({ onOK, onClear, hasSignature }: SignaturePadProps) {
  const ref = useRef<any>(null);

  const handleClear = () => {
    ref.current?.clearSignature();
    onClear?.();
  };

  const handleSave = () => {
    ref.current?.readSignature();
  };

  const webStyle = `
    .m-signature-pad--footer {
      display: none;
    }
    .m-signature-pad {
      position: relative;
      font-size: 10px;
      width: 100%;
      height: 100%;
      border: none;
      background-color: white;
    }
    .m-signature-pad--body {
      border: none;
    }
    canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    .m-signature-pad--body canvas {
      border: 2px dashed #ddd;
      border-radius: 8px;
    }
  `;

  return (
    <View style={styles.container}>
      <View style={styles.signatureArea}>
        <Signature
          ref={ref}
          onOK={onOK}
          onEmpty={() => onClear?.()}
          descriptionText=""
          clearText="Clear"
          confirmText="Save"
          webStyle={webStyle}
          backgroundColor="white"
          penColor="#333"/>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton]}
          onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.captureButton,
            hasSignature && styles.captureButtonActive
          ]}
          onPress={handleSave}>
          <Text style={[
            styles.captureButtonText,
            hasSignature && styles.captureButtonTextActive
          ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  signatureArea: {
    flex: 1,
    margin: 10,
  },
  controls: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fafafa",
  },
  controlButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  captureButton: {
    backgroundColor: "#8E8E93",
  },
  captureButtonActive: {
    backgroundColor: "#007AFF",
  },
  captureButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  captureButtonTextActive: {
    color: "white",
  },
});
