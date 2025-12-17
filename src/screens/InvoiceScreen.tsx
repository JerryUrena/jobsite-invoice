import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { getTaxRate } from "./SettingsScreen";
import LoadingOverlay from "../components/LoadingOverlay";

type RootStackParamList = {
  MainTabs: undefined;
  Invoice: undefined;
  Signature: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Invoice">;

interface LineItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
}

export default function InvoiceScreen({ navigation }: Props) {
  const [items, setItems] = useState<LineItem[]>([]);
  
  const [newItem, setNewItem] = useState({
    name: "",
    qty: "",
    rate: ""
  });
  
  const [taxRate, setTaxRate] = useState(8.0);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [isSaved, setIsSaved] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadTaxRate = async () => {
        const rate = await getTaxRate();
        setTaxRate(rate);
      };
      loadTaxRate();

      // Clear saved state when screen gains focus
      return () => {
        setIsSaved(false);
        setSavedInvoice(null);
      };
    }, [])
  );

  const addItem = async () => {
    if (isSaved) {
      setIsSaved(false);
      setSavedInvoice(null);
    }

    if (!newItem.name.trim() || !newItem.qty || !newItem.rate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Adding Item...");
    await new Promise(resolve => setTimeout(resolve, 500));

    const item: LineItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      qty: parseFloat(newItem.qty) || 0,
      rate: parseFloat(newItem.rate) || 0,
    };

    setItems([...items, item]);
    setNewItem({ name: "", qty: "", rate: "" });
    setIsLoading(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const INVOICES_KEY = "@jobsite_invoices";

  const saveInvoice = async (status = 'Draft') => {
    const invoice = {
      id: Date.now().toString(),
      items,
      subtotal,
      tax,
      taxRate,
      total,
      createdAt: new Date().toLocaleDateString(),
      status
    };
    setSavedInvoice(invoice);
    setIsSaved(true);
    try {
      const existing = await AsyncStorage.getItem(INVOICES_KEY);
      let invoices = [];
      if (existing) {
        invoices = JSON.parse(existing);
      }
      invoices.unshift(invoice); 
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    } catch (err) {
      // handle error silently
    }

    setItems([]);
    setNewItem({ name: "", qty: "", rate: "" });
    setLoadingMessage("Saving Invoice...");
    return invoice;
  };

  const handleEmailInvoice = async () => {
    setIsLoading(true);
    try {

      await new Promise(resolve => setTimeout(resolve, 1000));
      const invoice = await saveInvoice('Open');
      Alert.alert(
        "Invoice Saved", 
        `Invoice #${invoice.id} has been saved successfully! Email functionality will be implemented soon.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAndSave = async () => {
    setLoadingMessage("Saving Invoice...");
    setIsLoading(true);
    try {

      await new Promise(resolve => setTimeout(resolve, 500));
      await saveInvoice('Accepted');
      navigation.navigate("Signature");
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const renderItem = ({ item }: { item: LineItem }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.qty} × ${item.rate.toFixed(2)} = ${(item.qty * item.rate).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeItem(item.id)}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
      <View style={styles.content}>
        <Text style={styles.title}>Create Invoice</Text>

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Line Item</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Item name (e.g., Labor, Materials)"
            value={newItem.name}
            onChangeText={(text) => setNewItem({...newItem, name: text})}/>
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Quantity"
              value={newItem.qty}
              onChangeText={(text) => setNewItem({...newItem, qty: text})}
              keyboardType="numeric"/>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Rate ($)"
              value={newItem.rate}
              onChangeText={(text) => setNewItem({...newItem, rate: text})}
              keyboardType="numeric"/>
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(i) => i.id}
              renderItem={renderItem}
              scrollEnabled={false}/>
          )}
        </View>

        {isSaved && savedInvoice && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Invoice Saved</Text>
            <View style={styles.savedInfo}>
              <Text style={styles.savedLabel}>Invoice ID: <Text style={styles.savedValue}>#{savedInvoice.id}</Text></Text>
              <Text style={styles.savedLabel}>Date: <Text style={styles.savedValue}>{savedInvoice.createdAt}</Text></Text>
              <Text style={styles.savedLabel}>Status: <Text style={[styles.savedValue, styles.statusDraft]}>{savedInvoice.status}</Text></Text>
              <Text style={styles.savedLabel}>Total: <Text style={styles.savedValue}>${savedInvoice.total.toFixed(2)}</Text></Text>
            </View>
          </View>
        )}

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.emailButton]}
            onPress={handleEmailInvoice}
            disabled={items.length === 0}>
            <Text style={styles.emailButtonText}>Email Invoice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.signButton]}
            onPress={handleSignAndSave}
            disabled={items.length === 0}>
            <Text style={styles.signButtonText}>Sign & Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#444",
  },
  addSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  itemsSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  removeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalsSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  finalTotal: {
    borderTopWidth: 2,
    borderTopColor: "#007AFF",
    paddingTop: 12,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  finalTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  buttons: {
    gap: 15,
    paddingBottom: 20,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signButton: {
    backgroundColor: "#34C759",
  },
  signButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#8E8E93",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  savedSection: {
    backgroundColor: "#f0f9ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#34C759",
  },
  savedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 15,
    textAlign: "center",
  },
  savedInfo: {
    gap: 8,
  },
  savedLabel: {
    fontSize: 14,
    color: "#666",
  },
  savedValue: {
    fontWeight: "600",
    color: "#333",
  },
  statusDraft: {
    color: "#FF9500",
  },
  emailButton: {
    backgroundColor: "#007AFF",
  },
  emailButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
