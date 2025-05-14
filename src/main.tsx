
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * 应用程序入口
 * 
 * 使用React 18的createRoot API渲染App组件
 * 找到ID为"root"的DOM元素并将React应用挂载其中
 */
createRoot(document.getElementById("root")!).render(<App />);
