import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  full_name: string;
}

interface FileUploadPanelProps {
  allUsers: User[];
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({ allUsers }) => {
  const { t } = useLanguage();
  
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("w9");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile || !targetUser) {
      toast.error("Please select both a file and a target user");
      return;
    }
    
    setUploading(true);
    try {
      // Get the user's full name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', targetUser)
        .single();
        
      if (userError) throw userError;
      
      const fileName = `${userData.full_name}_${fileType}.pdf`;
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${fileName}`, selectedFile, {
          contentType: "application/pdf",
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("pdffileupload")
        .getPublicUrl(`uploads/${fileName}`);
      
      // Update the user's record with relevant information
      if (fileType === 'w9') {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            notes: `W9 File URL: ${urlData.publicUrl}` // Store URL in notes field as workaround
          })
          .eq('id', targetUser);
          
        if (updateError) throw updateError;
      }
      
      // Update or insert into SphereCheckIN table (keeping existing functionality)
      const updateData = {
        full_legal_name: userData.full_name,
        user_id: targetUser
      } as any;
      
      if (fileType === 'w9') {
        updateData.w9_file = urlData.publicUrl;
      } else if (fileType === 'nda') {
        updateData.nda_file = urlData.publicUrl;
      }
      
      const { data: checkData, error: checkError } = await supabase
        .from('SphereCheckIN')
        .select()
        .eq('full_legal_name', userData.full_name)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (checkData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('SphereCheckIN')
          .update(updateData)
          .eq('id', checkData.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('SphereCheckIN')
          .insert([updateData]);
          
        if (insertError) throw insertError;
      }
      
      toast.success(`File uploaded successfully for ${userData.full_name}`);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-green-600" />
          上传新文件
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="target-user">Target User</Label>
            <Select value={targetUser || ""} onValueChange={setTargetUser}>
              <SelectTrigger id="target-user" className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file-type">File Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger id="file-type" className="w-full">
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w9">W9</SelectItem>
                <SelectItem value="nda">NDA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file-upload">Upload File (PDF only)</Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleFileUpload} 
            disabled={uploading || !selectedFile || !targetUser}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadPanel;
