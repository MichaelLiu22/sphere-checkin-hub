
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData }) => {
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
    <div id="invoice-preview" className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* 发票头部 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">发票</h1>
          <p className="text-gray-600">发票号码: {invoiceData.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 mb-2">{invoiceData.billFrom.name}</div>
          <div className="text-gray-600 whitespace-pre-line">{invoiceData.billFrom.address}</div>
          <div className="text-gray-600">{invoiceData.billFrom.email}</div>
        </div>
      </div>

      {/* 日期信息 */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">账单信息</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="font-semibold">{invoiceData.billTo.name}</div>
            <div className="text-gray-600 whitespace-pre-line">{invoiceData.billTo.address}</div>
            <div className="text-gray-600">{invoiceData.billTo.email}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">日期</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">发票日期:</span>
              <span className="font-medium">{invoiceData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">到期日期:</span>
              <span className="font-medium">{invoiceData.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 项目列表 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">项目明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">描述</th>
                <th className="border border-gray-300 px-4 py-2 text-center">数量</th>
                <th className="border border-gray-300 px-4 py-2 text-right">单价</th>
                <th className="border border-gray-300 px-4 py-2 text-right">金额</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">¥{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">¥{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 总计 */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">小计:</span>
              <span>¥{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">税费 (10%):</span>
              <span>¥{calculateTax().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>总计:</span>
              <span className="text-blue-600">¥{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 备注和条款 */}
      {(invoiceData.notes || invoiceData.terms) && (
        <>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoiceData.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">备注</h3>
                <p className="text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
              </div>
            )}
            {invoiceData.terms && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">条款和条件</h3>
                <p className="text-gray-600 whitespace-pre-line">{invoiceData.terms}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 页脚 */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>感谢您的业务合作！</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
