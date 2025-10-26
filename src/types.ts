export type LineItem = { id: string; name: string; qty: number; rate: number };
export type Client = { id: string; name: string; phone?: string; email?: string };

export type Invoice = {
  id: string;
  client: Client;
  items: LineItem[];
  photos: string[];          
  signaturePng?: string;     
  taxRate: number;         
  markup: number;           
  total: number;
  paymentLink: string;     
  status: "Unpaid" | "Paid";
};
