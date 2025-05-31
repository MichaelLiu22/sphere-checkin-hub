import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData }) => {
  const isMobile = useIsMobile();
  
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
    <div id="invoice-preview" className="max-w-4xl mx-auto bg-white p-4 sm:p-8 shadow-lg">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
          <p className="text-sm sm:text-base text-gray-600">Invoice Number: {invoiceData.invoiceNumber}</p>
        </div>
        <div className="sm:text-right">
          <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-2">{invoiceData.billFrom.name}</div>
          <div className="text-sm sm:text-base text-gray-600 whitespace-pre-line">{invoiceData.billFrom.address}</div>
          <div className="text-sm sm:text-base text-gray-600">{invoiceData.billFrom.email}</div>
        </div>
      </div>

      {/* Date Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Bill To</h3>
          <div className="bg-gray-50 p-3 sm:p-4 rounded">
            <div className="font-semibold text-sm sm:text-base">{invoiceData.billTo.name}</div>
            <div className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{invoiceData.billTo.address}</div>
            <div className="text-xs sm:text-sm text-gray-600">{invoiceData.billTo.email}</div>
          </div>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Dates</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Invoice Date:</span>
              <span className="font-medium">{invoiceData.date}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{invoiceData.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4 sm:my-6" />

      {/* Items List */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Item Details</h3>
        
        {isMobile ? (
          // Mobile layout - card-based
          <div className="space-y-3">
            {invoiceData.items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="font-medium text-sm mb-2">{item.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Qty: </span>
                    <span>{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rate: </span>
                    <span>${item.rate.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Amount:</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop layout - table
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm sm:text-base">Rate</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm sm:text-base">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2 text-sm sm:text-base">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm sm:text-base">${item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm sm:text-base">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-end mb-6 sm:mb-8">
        <div className="w-full sm:w-64">
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Tax (10%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base sm:text-lg">
              <span>Total:</span>
              <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoiceData.notes || invoiceData.terms) && (
        <>
          <Separator className="my-4 sm:my-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {invoiceData.notes && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Notes</h3>
                <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
              </div>
            )}
            {invoiceData.terms && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Terms and Conditions</h3>
                <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{invoiceData.terms}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 text-center text-gray-500 text-xs sm:text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
