import { createContext, useContext, useState, type ReactNode } from 'react'

interface QuoteFormContextType {
  isOpen: boolean
  productInfo: { id: number; name: string; price: string } | null
  openQuoteForm: (product?: { id: number; name: string; price: string }) => void
  closeQuoteForm: () => void
}

const QuoteFormContext = createContext<QuoteFormContextType | undefined>(undefined)

export function QuoteFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [productInfo, setProductInfo] = useState<{ id: number; name: string; price: string } | null>(null)

  const openQuoteForm = (product?: { id: number; name: string; price: string }) => {
    setProductInfo(product || null)
    setIsOpen(true)
  }

  const closeQuoteForm = () => {
    setIsOpen(false)
    setProductInfo(null)
  }

  return (
    <QuoteFormContext.Provider value={{ isOpen, productInfo, openQuoteForm, closeQuoteForm }}>
      {children}
    </QuoteFormContext.Provider>
  )
}

export function useQuoteForm() {
  const context = useContext(QuoteFormContext)
  if (context === undefined) {
    throw new Error('useQuoteForm must be used within a QuoteFormProvider')
  }
  return context
}
