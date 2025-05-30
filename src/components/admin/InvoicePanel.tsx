
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import InvoicePreviewModal from './invoice/InvoicePreviewModal';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

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

const InvoicePanel: React.FC = () => {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billTo: {
      name: '',
      address: '',
      email: ''
    },
    billFrom: {
      name: 'Your Company Name',
      address: 'Your Company Address',
      email: 'your-email@company.com'
    },
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    notes: '',
    terms: 'Payment is due within 30 days'
  });

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleGeneratePDF = async () => {
    try {
      // Validate required fields
      if (!invoice.billTo.name) {
        toast.error('Please fill in customer name');
        return;
      }
      if (!invoice.items.some(item => item.description)) {
        toast.error('Please add at least one item');
        return;
      }

      await generateInvoicePDF(invoice);
      toast.success('PDF generated and downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF generation failed, please try again');
    }
  };

  const handlePreview = () => {
    // Validate required fields
    if (!invoice.billTo.name) {
      toast.error('Please fill in customer name before preview');
      return;
    }
    if (!invoice.items.some(item => item.description)) {
      toast.error('Please add at least one item before preview');
      return;
    }
    
    setShowPreview(true);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Invoice Creator</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bill To</h3>
                <div className="space-y-2">
                  <Label htmlFor="billToName">Customer Name</Label>
                  <Input
                    id="billToName"
                    value={invoice.billTo.name}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billTo: { ...prev.billTo, name: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billToAddress">Customer Address</Label>
                  <Textarea
                    id="billToAddress"
                    value={invoice.billTo.address}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billTo: { ...prev.billTo, address: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billToEmail">Customer Email</Label>
                  <Input
                    id="billToEmail"
                    type="email"
                    value={invoice.billTo.email}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billTo: { ...prev.billTo, email: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bill From</h3>
                <div className="space-y-2">
                  <Label htmlFor="billFromName">Company Name</Label>
                  <Input
                    id="billFromName"
                    value={invoice.billFrom.name}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billFrom: { ...prev.billFrom, name: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billFromAddress">Company Address</Label>
                  <Textarea
                    id="billFromAddress"
                    value={invoice.billFrom.address}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billFrom: { ...prev.billFrom, address: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billFromEmail">Company Email</Label>
                  <Input
                    id="billFromEmail"
                    type="email"
                    value={invoice.billFrom.email}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billFrom: { ...prev.billFrom, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Item Details</h3>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={`$${item.amount.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Thank you for your business..."
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Payment terms..."
                  value={invoice.terms}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <InvoicePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        invoiceData={invoice}
        onGeneratePDF={handleGeneratePDF}
      />
    </>
  );
};

export default InvoicePanel;
