
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

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

  const generatePDF = () => {
    // 这里可以集成PDF生成库
    toast.success('PDF生成功能正在开发中');
  };

  const previewInvoice = () => {
    toast.success('预览功能正在开发中');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">发票制作</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={previewInvoice}>
            <Eye className="h-4 w-4 mr-2" />
            预览
          </Button>
          <Button onClick={generatePDF}>
            <Download className="h-4 w-4 mr-2" />
            生成PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            发票信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">发票号码</Label>
              <Input
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                value={invoice.date}
                onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">到期日期</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* 账单信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">账单发送至</h3>
              <div className="space-y-2">
                <Label htmlFor="billToName">客户名称</Label>
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
                <Label htmlFor="billToAddress">客户地址</Label>
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
                <Label htmlFor="billToEmail">客户邮箱</Label>
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
              <h3 className="text-lg font-semibold">账单发送方</h3>
              <div className="space-y-2">
                <Label htmlFor="billFromName">公司名称</Label>
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
                <Label htmlFor="billFromAddress">公司地址</Label>
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
                <Label htmlFor="billFromEmail">公司邮箱</Label>
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

          {/* 项目列表 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">项目明细</h3>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加项目
              </Button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                  <div className="col-span-5">
                    <Input
                      placeholder="项目描述"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="数量"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="单价"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={`¥${item.amount.toFixed(2)}`}
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

            {/* 总计 */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>小计:</span>
                  <span>¥{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>税费 (10%):</span>
                  <span>¥{calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>总计:</span>
                  <span>¥{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 备注和条款 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                placeholder="感谢您的业务..."
                value={invoice.notes}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">条款和条件</Label>
              <Textarea
                id="terms"
                placeholder="付款条款..."
                value={invoice.terms}
                onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePanel;
