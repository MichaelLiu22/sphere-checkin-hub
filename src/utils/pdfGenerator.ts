
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import InvoicePDFTemplate from '@/components/admin/invoice/InvoicePDFTemplate';

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

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<void> => {
  try {
    // 创建一个临时的DOM元素来渲染PDF模板
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px'; // 固定宽度确保桌面版布局
    document.body.appendChild(tempDiv);

    // 渲染PDF模板组件到临时DOM元素
    const root = createRoot(tempDiv);
    const invoiceElement = React.createElement(InvoicePDFTemplate, { invoiceData });
    
    await new Promise<void>((resolve) => {
      root.render(invoiceElement);
      // 等待渲染完成
      setTimeout(resolve, 100);
    });

    const element = tempDiv.querySelector('#invoice-pdf-template') as HTMLElement;
    if (!element) {
      throw new Error('Invoice PDF template element not found');
    }

    // 使用html2canvas生成canvas，强制使用桌面版布局
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800, // 固定宽度
      windowWidth: 800, // 窗口宽度
    });

    // 创建PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 计算图片在PDF中的尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // 如果图片高度超过页面高度，需要分页
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // 分页处理
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    // 清理临时DOM元素
    root.unmount();
    document.body.removeChild(tempDiv);

    // 下载PDF
    pdf.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('PDF generation failed, please try again');
  }
};
