import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InvoiceViewScreen({ route, navigation }: any) {
  const { invoice: initialInvoice } = route.params;
  const [invoice, setInvoice] = useState(initialInvoice);

  const toggleStatus = async () => {
    const newStatus = invoice.status === 'Accepted' ? 'Not Accepted' : 'Accepted';
    const updatedInvoice = { ...invoice, status: newStatus };
    setInvoice(updatedInvoice);

    try {
      const key = "@jobsite_invoices";
      const data = await AsyncStorage.getItem(key);
      let invoices = [];
      if (data) invoices = JSON.parse(data);
      const idx = invoices.findIndex((inv: any) => inv.id === invoice.id);
      if (idx !== -1) {
        invoices[idx] = updatedInvoice;
        await AsyncStorage.setItem(key, JSON.stringify(invoices));
      }
    } catch {}
  };

  const handlePrint = async () => {
    let html = `<h2>Invoice #${invoice.id}</h2>
      <p><b>Date:</b> ${invoice.createdAt}</p>
      <p><b>Status:</b> ${invoice.status}</p>
      <p><b>Tax Rate:</b> ${invoice.taxRate}%</p>
      <p><b>Subtotal:</b> $${invoice.subtotal.toFixed(2)}</p>
      <p><b>Tax:</b> $${invoice.tax.toFixed(2)}</p>
      <p><b>Total:</b> $${invoice.total.toFixed(2)}</p>
      <h3>Line Items</h3>
      <ul>`;
    for (const item of invoice.items) {
      html += `<li>${item.name}: ${item.qty} × $${item.rate.toFixed(2)} = $${(item.qty * item.rate).toFixed(2)}</li>`;
    }
    html += `</ul>`;
    await Print.printAsync({ html });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            try {
              const key = "@jobsite_invoices";
              const data = await AsyncStorage.getItem(key);
              let invoices = [];
              if (data) invoices = JSON.parse(data);
              invoices = invoices.filter((inv: any) => inv.id !== invoice.id);
              await AsyncStorage.setItem(key, JSON.stringify(invoices));
              navigation.goBack();
            } catch {}
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice #{invoice.id}</Text>
      <Text style={styles.label}>Date: <Text style={styles.value}>{invoice.createdAt}</Text></Text>
      <View style={styles.statusRow}>
        <Text style={styles.label}>Status: </Text>
        <TouchableOpacity
          style={[styles.statusButton, invoice.status === 'Accepted' ? styles.accepted : styles.notAccepted]}
          onPress={toggleStatus}>
          <Text style={styles.statusButtonText}>{invoice.status}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Tax Rate: <Text style={styles.value}>{invoice.taxRate}%</Text></Text>
      <Text style={styles.label}>Subtotal: <Text style={styles.value}>${invoice.subtotal.toFixed(2)}</Text></Text>
      <Text style={styles.label}>Tax: <Text style={styles.value}>${invoice.tax.toFixed(2)}</Text></Text>
      <Text style={styles.label}>Total: <Text style={styles.value}>${invoice.total.toFixed(2)}</Text></Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Text style={styles.printButtonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Line Items</Text>
      <FlatList
        data={invoice.items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>{item.qty} × ${item.rate.toFixed(2)} = ${(item.qty * item.rate).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 2,
  },
  value: {
    fontWeight: '600',
    color: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusButton: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginLeft: 6,
  },
  accepted: {
    backgroundColor: '#34C759',
  },
  notAccepted: {
    backgroundColor: '#FF3B30',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  printButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  printButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
