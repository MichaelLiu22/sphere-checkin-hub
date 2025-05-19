
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  existingAttachments?: string[];
  maxFiles?: number;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onUploadComplete,
  existingAttachments = [],
  maxFiles = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>(existingAttachments);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate allowed file count
  const allowedFileCount = maxFiles - attachments.length;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      // Check if too many files are selected
      if (files.length > allowedFileCount) {
        toast.error(`最多只能上传 ${allowedFileCount} 个附件`);
        return;
      }
      
      const uploadedUrls: string[] = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `task-attachments/${fileName}`;
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`文件 ${file.name} 超过10MB限制`);
          continue;
        }
        
        // Upload the file
        const { error: uploadError, data } = await supabase.storage
          .from('tasks')
          .upload(filePath, file);
        
        if (uploadError) {
          toast.error(`上传文件 ${file.name} 失败`);
          console.error('Upload error:', uploadError);
          continue;
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tasks')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
        setProgress((i + 1) / files.length * 100);
      }
      
      // Update attachments and call the callback
      if (uploadedUrls.length > 0) {
        const newAttachments = [...attachments, ...uploadedUrls];
        setAttachments(newAttachments);
        onUploadComplete(newAttachments);
        toast.success(`成功上传 ${uploadedUrls.length} 个附件`);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传附件时出错');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    onUploadComplete(newAttachments);
  };

  return (
    <div className="space-y-3">
      {/* Display existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((url, index) => (
            <div 
              key={index}
              className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm"
            >
              <div className="truncate flex-1 pr-2">
                {url.split('/').pop()}
              </div>
              <Button
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => handleRemoveAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload button */}
      {allowedFileCount > 0 && (
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            className={cn(
              "text-sm w-full justify-start",
              uploading && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                上传中 ({Math.round(progress)}%)
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4 mr-2" />
                添加附件 {attachments.length > 0 ? `(${attachments.length}/${maxFiles})` : ''}
              </>
            )}
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        支持PDF、Word、Excel和图片，单个文件最大10MB
      </p>
    </div>
  );
};

export default AttachmentUploader;
