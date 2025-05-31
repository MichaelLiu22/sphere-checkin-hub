
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    email: string;
  };
  billFrom: {
    name: string;
    address: string;
    email: string;
  };
  items: InvoiceItem[];
  notes: string;
  terms: string;
}

interface InvoicePDFTemplateProps {
  invoiceData: InvoiceData;
}

const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({ invoiceData }) => {
  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div id="invoice-pdf-template" className="max-w-4xl mx-auto bg-white p-8 shadow-lg" style={{ minWidth: '800px' }}>
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
          <p className="text-base text-gray-600">Invoice Number: {invoiceData.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 mb-2">{invoiceData.billFrom.name}</div>
          <div className="text-base text-gray-600 whitespace-pre-line">{invoiceData.billFrom.address}</div>
          <div className="text-base text-gray-600">{invoiceData.billFrom.email}</div>
        </div>
      </div>

      {/* Date Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Bill To</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="font-semibold text-base">{invoiceData.billTo.name}</div>
            <div className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.billTo.address}</div>
            <div className="text-sm text-gray-600">{invoiceData.billTo.email}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Dates</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Invoice Date:</span>
              <span className="font-medium">{invoiceData.date}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{invoiceData.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Items List - Always use desktop table layout for PDF */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Item Details</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-base">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-center text-base">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-base">Rate</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-base">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2 text-base">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-base">${item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-base">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Tax (10%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoiceData.notes || invoiceData.terms) && (
        <>
          <Separator className="my-6" />
          <div className="grid grid-cols-2 gap-8">
            {invoiceData.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
              </div>
            )}
            {invoiceData.terms && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Terms and Conditions</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.terms}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default InvoicePDFTemplate;
