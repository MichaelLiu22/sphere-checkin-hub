
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import * as Dialog from '@radix-ui/react-dialog';

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

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
  onGeneratePDF: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  onGeneratePDF
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-4 left-4 right-4 bottom-4 bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">发票预览</h2>
            <div className="flex gap-2">
              <Button onClick={onGeneratePDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                生成PDF
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <InvoicePreview invoiceData={invoiceData} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InvoicePreviewModal;
