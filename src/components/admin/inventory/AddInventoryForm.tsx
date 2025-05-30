import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, Plus } from "lucide-react";
import SmartExcelImport from "./SmartExcelImport";
import type { Database } from "@/integrations/supabase/types";

type InReason = Database['public']['Enums']['inventory_in_reason'];

interface AddInventoryFormProps {
  onSuccess: () => void;
}

const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    product_name: "",
    quantity: "",
    unit_cost: "",
    batch_number: "",
    expiration_date: "",
    min_stock_alert: "10",
    in_reason: "" as InReason | ""
  });

  const inReasons: InReason[] = ["买货", "return", "赠送", "盘点", "调拨", "其它"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
      } else {
        toast.error("请选择图片文件");
      }
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("图片上传失败");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.product_name || !formData.quantity || !formData.unit_cost || !formData.in_reason) {
      toast.error("请填写所有必填字段");
      return;
    }

    setLoading(true);

    try {
      // 检查SKU是否已存在
      const { data: existingItem, error: queryError } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('sku', formData.sku)
        .maybeSingle();

      if (queryError) {
        console.error("Error querying inventory:", queryError);
        if (queryError.code === '406') {
          toast.error("权限不足，请确保已登录");
          return;
        }
        throw queryError;
      }

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const quantity = parseInt(formData.quantity);
      const unitCost = parseFloat(formData.unit_cost);
      const minStockAlert = parseInt(formData.min_stock_alert);
      const inReason = formData.in_reason as Database['public']['Enums']['inventory_in_reason'];

      if (existingItem) {
        // 如果SKU已存在，更新库存数量（累加）
        const newQuantity = existingItem.quantity + quantity;
        
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            quantity: newQuantity,
            unit_cost: unitCost,
            in_reason: inReason,
            ...(imageUrl && { image_url: imageUrl }),
            ...(formData.batch_number && { batch_number: formData.batch_number }),
            ...(formData.expiration_date && { expiration_date: formData.expiration_date }),
            min_stock_alert: minStockAlert
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;

        // 记录入库历史
        const { error: historyError } = await supabase
          .from('inventory_history')
          .insert({
            sku: formData.sku,
            product_name: formData.product_name,
            quantity: quantity,
            operation_type: 'in',
            unit_cost: unitCost,
            in_reason: inReason,
            batch_number: formData.batch_number || null,
            expiration_date: formData.expiration_date || null,
            reason: `入库补货 - ${inReason}`,
            created_by: user?.id
          });

        if (historyError) throw historyError;

        toast.success(`SKU ${formData.sku} 库存已更新，新增 ${quantity} 件`);
      } else {
        // 新建库存记录
        const { error: insertError } = await supabase
          .from('inventory')
          .insert({
            sku: formData.sku,
            product_name: formData.product_name,
            quantity: quantity,
            unit_cost: unitCost,
            in_reason: inReason,
            image_url: imageUrl,
            batch_number: formData.batch_number || null,
            expiration_date: formData.expiration_date || null,
            min_stock_alert: minStockAlert,
            created_by: user?.id
          });

        if (insertError) {
          console.error("Error inserting inventory:", insertError);
          throw insertError;
        }

        // 记录入库历史
        const { error: historyError } = await supabase
          .from('inventory_history')
          .insert({
            sku: formData.sku,
            product_name: formData.product_name,
            quantity: quantity,
            operation_type: 'in',
            unit_cost: unitCost,
            in_reason: inReason,
            batch_number: formData.batch_number || null,
            expiration_date: formData.expiration_date || null,
            reason: `新品入库 - ${inReason}`,
            created_by: user?.id
          });

        if (historyError) {
          console.error("Error inserting history:", historyError);
          throw historyError;
        }

        toast.success(`新商品 ${formData.product_name} 已成功入库`);
      }

      // 重置表单
      setFormData({
        sku: "",
        product_name: "",
        quantity: "",
        unit_cost: "",
        batch_number: "",
        expiration_date: "",
        min_stock_alert: "10",
        in_reason: "" as InReason | ""
      });
      setImageFile(null);
      
      onSuccess();
    } catch (error: any) {
      console.error("Error adding inventory:", error);
      toast.error("入库操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="manual" className="space-y-4">
      <TabsList>
        <TabsTrigger value="manual">手动入库</TabsTrigger>
        <TabsTrigger value="excel">智能Excel导入</TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              手动入库
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU编号 *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="请输入SKU编号"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_name">商品名称 *</Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    placeholder="请输入商品名称"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">入库数量 *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="请输入入库数量"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_cost">单件成本 *</Label>
                  <Input
                    id="unit_cost"
                    name="unit_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_cost}
                    onChange={handleInputChange}
                    placeholder="请输入单件成本"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="in_reason">入库原因 *</Label>
                  <Select onValueChange={(value: InReason) => setFormData(prev => ({ ...prev, in_reason: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择入库原因" />
                    </SelectTrigger>
                    <SelectContent>
                      {inReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_number">批次编号</Label>
                  <Input
                    id="batch_number"
                    name="batch_number"
                    value={formData.batch_number}
                    onChange={handleInputChange}
                    placeholder="请输入批次编号（可选）"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration_date">有效期</Label>
                  <Input
                    id="expiration_date"
                    name="expiration_date"
                    type="date"
                    value={formData.expiration_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock_alert">最低库存告警</Label>
                  <Input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    min="0"
                    value={formData.min_stock_alert}
                    onChange={handleInputChange}
                    placeholder="库存低于此数量时告警"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">商品图片</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {imageFile && (
                    <p className="text-sm text-muted-foreground">
                      已选择: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      确认入库
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="excel">
        <SmartExcelImport onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
};

export default AddInventoryForm;
