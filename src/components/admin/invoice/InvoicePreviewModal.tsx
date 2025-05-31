import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import * as Dialog from '@radix-ui/react-dialog';
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
  const isMobile = useIsMobile();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className={`fixed ${
          isMobile 
            ? 'top-2 left-2 right-2 bottom-2' 
            : 'top-4 left-4 right-4 bottom-4'
        } bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border-b gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Invoice Preview</h2>
            <div className="flex gap-2">
              <Button 
                onClick={onGeneratePDF} 
                className="flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
                size={isMobile ? "sm" : "default"}
              >
                <Download className="h-4 w-4" />
                Generate PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-100">
            <InvoicePreview invoiceData={invoiceData} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InvoicePreviewModal;
