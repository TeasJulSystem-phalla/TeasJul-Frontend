import AppRoutes from './routes/AppRoutes'
import { ToastProvider } from './components/ui/Toast'

const App = () => {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App
