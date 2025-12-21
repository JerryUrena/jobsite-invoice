import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView, 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignaturePad from "../components/Signature";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import LoadingOverlay from "../components/LoadingOverlay";

type RootStackParamList = {
  MainTabs: undefined;
  Invoice: undefined;
  Signature: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Signature">;

export default function SignatureScreen({ navigation }: Props) {
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setResetKey(prev => prev + 1);
      setHasSignature(false);
      setSignatureData("");
    }, [])
  );

  const handleSignature = (data: string) => {
    setSignatureData(data);
    setHasSignature(true);
  };

  const handleClear = () => {
    setHasSignature(false);
    setSignatureData("");
  };

  const handleSave = async () => {
    if (!hasSignature) {
      Alert.alert("No Signature", "Please add your signature before saving.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save signature to the most recent invoice
      const key = "@jobsite_invoices";
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const invoices = JSON.parse(data);
        if (invoices.length > 0) {
          invoices[0].signature = signatureData;
          await AsyncStorage.setItem(key, JSON.stringify(invoices));
        }
      }
    } catch (err) {
      // handle error silently
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);

    Alert.alert(
      "Signature Saved",
      "Your signature has been saved successfully!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("MainTabs"),
        },
      ]
    );
  };

  const handleCancel = () => {
    if (hasSignature) {
      Alert.alert(
        "Discard Signature?",
        "Are you sure you want to discard your signature?",
        [
          { text: "Keep Signing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Saving Signature..." />
      <View style={styles.header}>
        <Text style={styles.title}>Sign Invoice</Text>
        <Text style={styles.subtitle}>
          Please sign in the area below to complete your invoice
        </Text>
      </View>

      <View style={styles.signatureContainer}>
        <SignaturePad
          key={resetKey}
          onOK={handleSignature}
          onClear={handleClear}
          hasSignature={hasSignature}/>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Use your finger to sign in the white area above
        </Text>
        {hasSignature && (
          <Text style={styles.successText}>
            Signature captured successfully!
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, !hasSignature && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!hasSignature}>
          <Text style={styles.saveButtonText}>Save & Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  signatureContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  instructions: {
    padding: 20,
    paddingTop: 0,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    color: "#34C759",
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#34C759",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
