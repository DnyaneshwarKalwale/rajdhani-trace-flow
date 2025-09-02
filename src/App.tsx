import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import NewOrder from "./pages/orders/NewOrder";
import AddItem from "./pages/orders/AddItem";
import OrderDetails from "./pages/orders/OrderDetails";
import Inventory from "./pages/Inventory";
import FinishedGoods from "./pages/inventory/FinishedGoods";
import LowStocks from "./pages/inventory/LowStocks";
import Production from "./pages/Production";
import NewBatch from "./pages/production/NewBatch";
import Planning from "./pages/production/Planning";
import Complete from "./pages/production/Complete";
import Materials from "./pages/Materials";
import ManageStock from "./pages/ManageStock";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductStock from "./pages/ProductStock";
import ProductionDetail from "./pages/ProductionDetail";
import RajdhaniERP from "@/lib/storage";
import { useEffect } from "react";


const queryClient = new QueryClient();

const App = () => {
  // Initialize Rajdhani ERP System
  useEffect(() => {
    RajdhaniERP.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<NewOrder />} />
                <Route path="/orders/add-item" element={<AddItem />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/finished-goods" element={<FinishedGoods />} />
                <Route path="/inventory/low-stocks" element={<LowStocks />} />
                <Route path="/production" element={<Production />} />
                <Route path="/production/new-batch" element={<NewBatch />} />
                <Route path="/production/planning" element={<Planning />} />
                <Route path="/production/complete" element={<Complete />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/manage-stock" element={<ManageStock />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/product-stock/:productId" element={<ProductStock />} />
                <Route path="/production/:productId" element={<ProductionDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
