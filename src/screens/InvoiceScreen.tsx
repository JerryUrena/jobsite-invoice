import React, { useState } from "react";
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
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", name: "Labor", qty: 2, rate: 75 },
    { id: "2", name: "Materials", qty: 1, rate: 120 },
  ]);
  
  const [newItem, setNewItem] = useState({
    name: "",
    qty: "",
    rate: ""
  });

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.qty || !newItem.rate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const item: LineItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      qty: parseFloat(newItem.qty) || 0,
      rate: parseFloat(newItem.rate) || 0,
    };

    setItems([...items, item]);
    setNewItem({ name: "", qty: "", rate: "" });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const tax = subtotal * 0.08; // 8% tax
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
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Invoice</Text>

        {/* Add New Item Section */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Line Item</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Item name (e.g., Labor, Materials)"
            value={newItem.name}
            onChangeText={(text) => setNewItem({...newItem, name: text})}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Quantity"
              value={newItem.qty}
              onChangeText={(text) => setNewItem({...newItem, qty: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Rate ($)"
              value={newItem.rate}
              onChangeText={(text) => setNewItem({...newItem, rate: text})}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(i) => i.id}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (8%):</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.signButton]}
            onPress={() => navigation.navigate("Signature")}
          >
            <Text style={styles.signButtonText}>Sign Invoice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.backButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
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
});
