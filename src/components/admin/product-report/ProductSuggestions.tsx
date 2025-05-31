
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductSuggestion {
  title: string;
  description: string;
}

interface ProductSuggestionsProps {
  query: string;
  onSelect: (productName: string) => void;
  onConfirm: () => void;
  isVisible: boolean;
}

const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({
  query,
  onSelect,
  onConfirm,
  isVisible
}) => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('product-research', {
          body: { query },
          headers: {
            'Content-Type': 'application/json',
          }
        }, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // 手动构建URL以包含action参数
        const response = await fetch(
          `${supabase.supabaseUrl}/functions/v1/product-research?action=suggest`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
            },
            body: JSON.stringify({ query })
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('获取建议失败:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (productName: string) => {
    setSelectedProduct(productName);
    onSelect(productName);
  };

  if (!isVisible || query.length < 2) {
    return null;
  }

  return (
    <Card className="mt-2">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Search className="h-4 w-4" />
            <span>选择正确的产品名称:</span>
          </div>
          
          {loading ? (
            <div className="text-sm text-muted-foreground">搜索中...</div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(suggestion.title)}
                  className={`w-full text-left p-3 rounded border hover:bg-accent/50 transition-colors ${
                    selectedProduct === suggestion.title 
                      ? 'border-primary bg-accent' 
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium">{suggestion.title}</div>
                  {suggestion.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </div>
                  )}
                </button>
              ))}
              
              {/* 选项：使用原始输入 */}
              <button
                onClick={() => handleSelect(query)}
                className={`w-full text-left p-3 rounded border hover:bg-accent/50 transition-colors ${
                  selectedProduct === query 
                    ? 'border-primary bg-accent' 
                    : 'border-border'
                }`}
              >
                <div className="font-medium">使用原始输入: "{query}"</div>
                <div className="text-sm text-muted-foreground">
                  如果没有找到合适的建议，使用您输入的原始名称
                </div>
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              没有找到相关产品建议，您可以使用原始输入继续
            </div>
          )}
          
          {selectedProduct && (
            <div className="pt-3 border-t">
              <Button 
                onClick={onConfirm}
                className="w-full flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                确认使用: {selectedProduct}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSuggestions;
