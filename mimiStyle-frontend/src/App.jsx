import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductManagementPage from './pages/ProductManagementPage';
import ProductDashboardPage from './pages/ProductDashboardPage';
import ProductOrdersPage from './pages/ProductOrdersPage';
import ProductManagementLayout from './components/layout/ProductManagementLayout';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import RevenuePage from './pages/RevenuePage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutPaymentPage from './pages/CheckoutPaymentPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import RentProductsPage from './pages/RentProductsPage';
import AboutPage from './pages/AboutPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProtectedRoute><ProductManagementLayout /></ProtectedRoute>}>
          <Route index element={<ProductDashboardPage />} />
          <Route path="list" element={<ProductManagementPage />} />
          <Route path="orders" element={<ProductOrdersPage />} />
          <Route path="add" element={<AddProductPage />} />
        </Route>
        <Route
          path="/rent"
          element={
            <ProtectedRoute>
              <RentProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <ProtectedRoute>
              <RevenuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute>
              <CheckoutPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
