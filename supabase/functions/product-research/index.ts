import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductResearchRequest {
  productName: string;
  userId: string;
}

interface ProductSuggestionRequest {
  query: string;
  action?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    
    // 处理产品建议请求
    if (requestBody.action === 'suggest' || requestBody.query) {
      const { query }: ProductSuggestionRequest = requestBody
      
      if (!query || query.length < 2) {
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`获取产品建议: ${query}`)

      // 从维基百科搜索API获取建议
      const suggestions = []
      try {
        const searchResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/search/${encodeURIComponent(query)}?limit=5`
        )
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          suggestions.push(...searchData.pages.map((page: any) => ({
            title: page.title,
            description: page.description || page.extract || ''
          })))
        }
      } catch (error) {
        console.error('维基百科搜索错误:', error)
      }

      // 添加一些常见产品建议
      const commonProducts = [
        'Jordan 1 Chicago',
        'iPhone 15 Pro',
        'Nike Air Force 1',
        'Adidas Yeezy 350',
        'Louis Vuitton Speedy',
        'Rolex Submariner',
        'MacBook Pro M3',
        'PlayStation 5'
      ].filter(product => product.toLowerCase().includes(query.toLowerCase()))

      commonProducts.forEach(product => {
        if (!suggestions.find(s => s.title === product)) {
          suggestions.push({ title: product, description: 'Popular product' })
        }
      })

      return new Response(
        JSON.stringify({ suggestions: suggestions.slice(0, 8) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 处理产品研究请求
    const { productName, userId }: ProductResearchRequest = requestBody
    
    if (!productName || !userId) {
      throw new Error('Missing required parameters')
    }

    console.log(`开始研究产品: ${productName} for user: ${userId}`)

    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 验证用户是否存在于public.users表中
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw new Error(`用户不存在: ${userError?.message}`)
    }

    // 检查缓存
    const cacheResults = await Promise.all([
      supabase.from('product_cache')
        .select('*')
        .eq('product_name', productName)
        .eq('data_source', 'wikipedia')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
      supabase.from('product_cache')
        .select('*')
        .eq('product_name', productName)
        .eq('data_source', 'images')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()
    ])

    let wikipediaData = cacheResults[0].data?.cached_data
    let imagesData = cacheResults[1].data?.cached_data

    // 获取维基百科数据
    if (!wikipediaData) {
      console.log('获取维基百科数据...')
      try {
        const searchResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(productName)}`
        )
        
        if (searchResponse.ok) {
          wikipediaData = await searchResponse.json()
          
          // 缓存数据
          await supabase.from('product_cache').insert({
            product_name: productName,
            data_source: 'wikipedia',
            cached_data: wikipediaData,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时
          })
        }
      } catch (error) {
        console.error('维基百科API错误:', error)
        wikipediaData = { error: 'Failed to fetch Wikipedia data' }
      }
    }

    // 获取图片数据 (使用 Unsplash 作为示例)
    if (!imagesData) {
      console.log('获取产品图片...')
      try {
        // 这里可以集成 Unsplash API 或其他图片服务
        // 为演示目的，我们创建一些模拟数据
        imagesData = {
          images: [
            { url: `https://source.unsplash.com/800x600/?${encodeURIComponent(productName)}` },
            { url: `https://source.unsplash.com/800x600/?${encodeURIComponent(productName)},product` },
            { url: `https://source.unsplash.com/800x600/?${encodeURIComponent(productName)},fashion` }
          ]
        }
        
        // 缓存图片数据
        await supabase.from('product_cache').insert({
          product_name: productName,
          data_source: 'images',
          cached_data: imagesData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天
        })
      } catch (error) {
        console.error('图片获取错误:', error)
        imagesData = { images: [] }
      }
    }

    // 模拟市场数据 (实际项目中可以集成 StockX API)
    const stockxData = {
      prices: {
        current: Math.floor(Math.random() * 1000 + 100),
        average: Math.floor(Math.random() * 800 + 150),
        highest: Math.floor(Math.random() * 1500 + 200),
        lowest: Math.floor(Math.random() * 500 + 50)
      },
      volume: Math.floor(Math.random() * 1000 + 10),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }

    // 整合所有数据
    const reportData = {
      wikipedia: wikipediaData,
      stockx: stockxData,
      images: imagesData?.images || [],
      generated_at: new Date().toISOString()
    }

    console.log('数据收集完成，保存报告...')

    // 保存报告到数据库 - 使用正确的用户ID引用
    const { data: savedReport, error: saveError } = await supabase
      .from('product_reports')
      .insert({
        product_name: productName,
        report_data: reportData,
        created_by: userId,
        pdf_url: null // PDF将在后续生成
      })
      .select()
      .single()

    if (saveError) {
      console.error('保存报告失败:', saveError)
      throw new Error(`保存报告失败: ${saveError.message}`)
    }

    console.log('报告保存成功:', savedReport.id)

    return new Response(
      JSON.stringify({
        success: true,
        reportId: savedReport.id,
        message: '产品报告生成成功',
        data: reportData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('产品研究失败:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '未知错误'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
