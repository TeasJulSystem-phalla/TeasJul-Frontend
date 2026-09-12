import AppRoutes from './routes/AppRoutes'
import { ToastProvider } from './components/ui/Toast'
import ThemeProvider from './components/common/ThemeProvider'

const App = () => {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </ToastProvider>
  )
}

export default App