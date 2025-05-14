
import * as React from "react"

/**
 * 移动设备断点宽度（像素）
 * 低于此宽度的屏幕被视为移动设备
 */
const MOBILE_BREAKPOINT = 768

/**
 * 检测当前设备是否为移动设备的Hook
 * 
 * 基于屏幕宽度判断，会在窗口大小改变时重新计算
 * @returns {boolean} 如果是移动设备则返回true，否则返回false
 */
export function useIsMobile() {
  // 存储移动设备状态，初始值为undefined
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // 在组件挂载和更新时设置和更新移动设备状态
  React.useEffect(() => {
    // 创建媒体查询匹配器
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // 媒体查询变化处理函数
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // 添加事件监听器
    mql.addEventListener("change", onChange)
    
    // 初始设置移动设备状态
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // 组件卸载时移除事件监听器
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // 确保返回布尔值，如果状态未定义则返回false
  return !!isMobile
}
