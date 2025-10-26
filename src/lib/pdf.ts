import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Invoice } from "../types";

export async function generateInvoicePdf(inv: Invoice) {

  const itemsRows = inv.items.map(i => `
    <tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">$${i.rate.toFixed(2)}</td><td style="text-align:right">$${(i.qty*i.rate).toFixed(2)}</td></tr>
  `).join("");

  const photos = inv.photos.map(u => `<img src="${u}" style="width:140px;height:auto;margin-right:8px" />`).join("");

  const html = `
  <html><body style="font-family: -apple-system, Roboto, Arial; padding:16px">
    <h2>Invoice ${inv.id}</h2>
    <div>Client: <b>${inv.client.name}</b></div>
    <div>Status: <b>${inv.status}</b></div>
    <hr/>
    <table style="width:100%; border-collapse:collapse">
      <thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Rate</th><th align="right">Total</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p><b>Total: $${inv.total.toFixed(2)}</b></p>
    <p>Payment: <a href="${inv.paymentLink}">${inv.paymentLink}</a></p>
    <div>Photos:</div>
    <div>${photos}</div>
    ${inv.signaturePng ? `<div style="margin-top:12px"><div>Signature:</div><img src="${inv.signaturePng}" style="width:200px;height:auto;border:1px solid #ccc"/></div>` : ``}
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri; 
}

export async function shareFile(uri: string) {
  
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) await Sharing.shareAsync(uri);
}
