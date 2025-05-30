
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  productName: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  open,
  onOpenChange,
  imageUrl,
  productName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="relative">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-auto max-h-[85vh] object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-center">{productName}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
