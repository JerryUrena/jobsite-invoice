import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch } from "react-native";
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

  const togglePaid = async () => {
    let updatedInvoice;
    if (!invoice.paid) {
      // Marking as paid: save current status and set to Completed
      updatedInvoice = { 
        ...invoice, 
        paid: true, 
        previousStatus: invoice.status,
        status: 'Completed' 
      };
    } else {
      // Unmarking as paid: restore previous status
      updatedInvoice = { 
        ...invoice, 
        paid: false, 
        status: invoice.previousStatus || 'Not Accepted' 
      };
    }
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
    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { color: #333; border-bottom: 2px solid #007AFF; padding-bottom: 10px; }
          h3 { color: #444; margin-top: 20px; }
          .info { margin: 5px 0; }
          .info b { color: #555; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
          .photos { margin-top: 20px; }
          .photos img { width: 150px; height: 150px; object-fit: cover; margin: 5px; border-radius: 8px; border: 1px solid #ddd; }
          .signature { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
          .signature img { max-width: 300px; height: auto; }
          .totals { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .final-total { font-size: 1.2em; font-weight: bold; color: #007AFF; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h2>Invoice #${invoice.id}</h2>
        <p class="info"><b>Date:</b> ${invoice.createdAt}</p>
        <p class="info"><b>Status:</b> ${invoice.status}</p>
        <p class="info"><b>Payment:</b> ${invoice.paid ? 'Paid' : 'Unpaid'}</p>
        
        <h3>Line Items</h3>
        <ul>`;
    
    for (const item of invoice.items) {
      html += `<li><b>${item.name}</b>: ${item.qty} × $${item.rate.toFixed(2)} = <b>$${(item.qty * item.rate).toFixed(2)}</b></li>`;
    }
    
    html += `</ul>
        
        <div class="totals">
          <div class="total-row"><span>Subtotal:</span> <span>$${invoice.subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>Tax (${invoice.taxRate}%):</span> <span>$${invoice.tax.toFixed(2)}</span></div>
          <div class="total-row final-total"><span>Total:</span> <span>$${invoice.total.toFixed(2)}</span></div>
        </div>`;
    
    // Add photos if any
    if (invoice.photos && invoice.photos.length > 0) {
      html += `<div class="photos"><h3>Photos</h3>`;
      for (const photo of invoice.photos) {
        html += `<img src="${photo}" />`;
      }
      html += `</div>`;
    }
    
    // Add signature if exists
    if (invoice.signature) {
      html += `
        <div class="signature">
          <h3>Signature</h3>
          <img src="${invoice.signature}" />
        </div>`;
    }
    
    html += `</body></html>`;
    
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
          style={[styles.statusButton, 
            invoice.status === 'Completed' ? styles.completed : 
            invoice.status === 'Accepted' ? styles.accepted : styles.notAccepted
          ]}
          onPress={toggleStatus}
          disabled={invoice.paid}>
          <Text style={styles.statusButtonText}>{invoice.status}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paidRow}>
        <Text style={styles.label}>Paid: </Text>
        <Switch
          value={invoice.paid || false}
          onValueChange={togglePaid}
          trackColor={{ false: '#ccc', true: '#34C759' }}
          thumbColor={invoice.paid ? '#fff' : '#f4f3f4'}
        />
        <Text style={[styles.paidLabel, invoice.paid ? styles.paidYes : styles.paidNo]}>
          {invoice.paid ? 'Yes' : 'No'}
        </Text>
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
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paidLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  paidYes: {
    color: '#34C759',
  },
  paidNo: {
    color: '#8E8E93',
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
    backgroundColor: '#FF9500',
  },
  completed: {
    backgroundColor: '#007AFF',
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
