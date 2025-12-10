import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@jobsite_settings";

interface Settings {
  taxRate: number;
}

const DEFAULT_SETTINGS: Settings = {
  taxRate: 8.0, 
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [taxRateText, setTaxRateText] = useState("8.0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTaxRateText(parsed.taxRate.toString());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const taxRate = parseFloat(taxRateText);
      
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        Alert.alert("Invalid Tax Rate", "Please enter a tax rate between 0 and 100");
        return;
      }

      const newSettings: Settings = {
        taxRate,
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      
      Alert.alert("Settings Saved", "Your tax rate has been updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const resetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset to default settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(SETTINGS_KEY);
              setSettings(DEFAULT_SETTINGS);
              setTaxRateText(DEFAULT_SETTINGS.taxRate.toString());
              Alert.alert("Settings Reset", "Settings have been reset to defaults.");
            } catch (error) {
              console.error("Error resetting settings:", error);
              Alert.alert("Error", "Failed to reset settings.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tax Rate (%)</Text>
            <Text style={styles.settingDescription}>
              Set the tax rate to be applied to all invoices
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={taxRateText}
                onChangeText={setTaxRateText}
                placeholder="8.0"
                keyboardType="numeric"
                maxLength={5}/>

              <Text style={styles.inputSuffix}>%</Text>
            </View>
            
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

export const getTaxRate = async (): Promise<number> => {
  try {
    const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.taxRate || DEFAULT_SETTINGS.taxRate;
    }
    return DEFAULT_SETTINGS.taxRate;
  } catch (error) {
    console.error("Error getting tax rate:", error);
    return DEFAULT_SETTINGS.taxRate;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  settingItem: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    textAlign: "right",
  },
  inputSuffix: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  previewContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  previewLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  previewText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  buttons: {
    gap: 15,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#34C759",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  currentSettings: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSettingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  currentSettingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  currentSettingLabel: {
    fontSize: 16,
    color: "#666",
  },
  currentSettingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});