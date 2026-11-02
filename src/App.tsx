import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { CurrencyProvider } from './context/CurrencyContext';
import { Categories } from './pages/Categories';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="categories" element={<Categories />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  );
}
