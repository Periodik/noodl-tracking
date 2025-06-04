'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, AlertTriangle, Package, Trash2, Edit, Eye, X, Check, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  received_state: 'Cold' | 'Frozen';
  portion_size: number;
  portion_unit: string;
  shelf_life_fresh: number;
  shelf_life_thawed: number;
  track_by_unit: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PurchaseBatch {
  id: string;
  product_id: string;
  purchase_date: string;
  best_before_date: string;
  quantity_received: number;
  quantity_unit: string;
  portioned_count: number;
  remaining_portions: number;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
  product?: Product;
  thawed_batches?: ThawedBatch[];
}

interface ThawedBatch {
  id: string;
  purchase_batch_id: string;
  thaw_date: string;
  portions_thawed: number;
  expiry_date: string;
  status: string;
  remaining_portions: number;
  purchase_batch?: {
    product?: Product;
  };
}

interface Alert {
  id: string;
  type: string;
  product_name: string;
  batch_id: string;
  batch_type?: string;
  expiry_date: Date;
  quantity: number;
  days_until_expiry: number;
  status: string;
}

interface WasteEntry {
  id: string;
  product_id: string;
  purchase_batch_id?: string;
  thawed_batch_id?: string;
  batch_type?: string;
  date_discarded: string;
  quantity_discarded: number;
  reason: string;
  notes?: string;
  discarded_by?: string;
  product?: Product;
}

const NOODLTrackingApp = () => {
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([]);
  const [thawedBatches, setThawedBatches] = useState<ThawedBatch[]>([]);
  const [wasteLog, setWasteLog] = useState<WasteEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Generate alerts when data changes
  useEffect(() => {
    generateAlerts();
  }, [purchaseBatches, thawedBatches]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [productsRes, purchasesRes, thawedRes, wasteRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/purchases'),
        fetch('/api/thawed'),
        fetch('/api/waste')
      ]);

      if (!productsRes.ok || !purchasesRes.ok || !thawedRes.ok || !wasteRes.ok) {
        throw new Error('Failed to load data');
      }

      const [productsData, purchasesData, thawedData, wasteData] = await Promise.all([
        productsRes.json(),
        purchasesRes.json(),
        thawedRes.json(),
        wasteRes.json()
      ]);

      setProducts(productsData);
      setPurchaseBatches(purchasesData);
      setThawedBatches(thawedData);
      setWasteLog(wasteData);

    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const today = new Date();
    
    // Check purchase batches for best-before dates
    purchaseBatches.forEach(batch => {
      const product = batch.product || products.find(p => p.id === batch.product_id);
      const expiryDate = new Date(batch.best_before_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 2 && batch.remaining_portions > 0) {
        newAlerts.push({
          id: `alert_${batch.id}`,
          type: daysUntilExpiry <= 0 ? 'expired' : 'expiring_soon',
          product_name: product?.name || 'Unknown',
          batch_id: batch.id,
          expiry_date: expiryDate,
          quantity: batch.remaining_portions,
          days_until_expiry: daysUntilExpiry,
          status: 'active'
        });
      }
    });

    // Check thawed batches
    thawedBatches.forEach(batch => {
      const product = batch.purchase_batch?.product || 
                     purchaseBatches.find(p => p.id === batch.purchase_batch_id)?.product ||
                     products.find(p => p.id === purchaseBatches.find(pb => pb.id === batch.purchase_batch_id)?.product_id);
      const expiryDate = new Date(batch.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 2 && batch.remaining_portions > 0) {
        newAlerts.push({
          id: `alert_thaw_${batch.id}`,
          type: daysUntilExpiry <= 0 ? 'expired' : 'expiring_soon',
          product_name: product?.name || 'Unknown',
          batch_id: batch.id,
          batch_type: 'thawed',
          expiry_date: expiryDate,
          quantity: batch.remaining_portions,
          days_until_expiry: daysUntilExpiry,
          status: 'active'
        });
      }
    });

    setAlerts(newAlerts.filter(alert => alert.status === 'active'));
  };

  const getAlertColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'bg-red-100 border-red-500 text-red-800';
    if (daysUntilExpiry <= 2) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-green-100 border-green-500 text-green-800';
  };

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const openModal = (type: string, data: Record<string, any> = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      switch (modalType) {
        case 'product':
          const productMethod = formData.id ? 'PUT' : 'POST';
          const productRes = await fetch('/api/products', {
            method: productMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (!productRes.ok) throw new Error('Failed to save product');
          
          // Reload products
          const productsRes = await fetch('/api/products');
          const productsData = await productsRes.json();
          setProducts(productsData);
          break;
          
        case 'purchase':
          const purchaseRes = await fetch('/api/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (!purchaseRes.ok) throw new Error('Failed to save purchase');
          
          // Reload purchases
          const purchasesRes = await fetch('/api/purchases');
          const purchasesData = await purchasesRes.json();
          setPurchaseBatches(purchasesData);
          break;
          
        case 'editPurchase':
          const editRes = await fetch('/api/purchases', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (!editRes.ok) throw new Error('Failed to update purchase');
          
          // Reload purchases
          const updatedPurchasesRes = await fetch('/api/purchases');
          const updatedPurchasesData = await updatedPurchasesRes.json();
          setPurchaseBatches(updatedPurchasesData);
          break;
          
        case 'thaw':
          const thawRes = await fetch('/api/thawed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              purchase_batch_id: formData.purchase_batch_id,
              portions_thawed: parseInt(formData.portions_to_thaw)
            })
          });
          
          if (!thawRes.ok) throw new Error('Failed to thaw portions');
          
          // Reload both purchases and thawed data
          const [newPurchasesRes, newThawedRes] = await Promise.all([
            fetch('/api/purchases'),
            fetch('/api/thawed')
          ]);
          
          const [newPurchasesData, newThawedData] = await Promise.all([
            newPurchasesRes.json(),
            newThawedRes.json()
          ]);
          
          setPurchaseBatches(newPurchasesData);
          setThawedBatches(newThawedData);
          break;
          
        case 'waste':
          const wasteRes = await fetch('/api/waste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: formData.product_id || 
                         purchaseBatches.find(b => b.id === formData.batch_id)?.product_id ||
                         thawedBatches.find(b => b.id === formData.batch_id)?.purchase_batch?.product?.id,
              purchase_batch_id: formData.batch_type === 'purchase' ? formData.batch_id : null,
              thawed_batch_id: formData.batch_type === 'thawed' ? formData.batch_id : null,
              batch_type: formData.batch_type,
              quantity_discarded: parseInt(formData.quantity_discarded),
              reason: formData.reason,
              notes: formData.notes
            })
          });
          
          if (!wasteRes.ok) throw new Error('Failed to log waste');
          
          // Reload all affected data
          const [wasteLogRes, batchesRes, thawedRefreshRes] = await Promise.all([
            fetch('/api/waste'),
            fetch('/api/purchases'),
            fetch('/api/thawed')
          ]);
          
          const [wasteLogData, batchesData, thawedRefreshData] = await Promise.all([
            wasteLogRes.json(),
            batchesRes.json(),
            thawedRefreshRes.json()
          ]);
          
          setWasteLog(wasteLogData);
          setPurchaseBatches(batchesData);
          setThawedBatches(thawedRefreshData);
          break;
      }
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const clearAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading NOODL Tracking...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !showModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 print-optimize">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${getAlertColor(alert.days_until_expiry)}`}>
                <div>
                  <div className="font-semibold">{alert.product_name}</div>
                  <div className="text-sm">
                    {alert.quantity} portions • Expires: {formatDate(alert.expiry_date.toISOString())}
                    {alert.days_until_expiry <= 0 ? ' (EXPIRED)' : ` (${alert.days_until_expiry} days)`}
                  </div>
                </div>
                <div className="flex space-x-2 no-print">
                  <button
                    onClick={() => {
                      const productId = alert.batch_type === 'thawed' 
                        ? thawedBatches.find(b => b.id === alert.batch_id)?.purchase_batch?.product?.id ||
                          purchaseBatches.find(b => b.id === thawedBatches.find(tb => tb.id === alert.batch_id)?.purchase_batch_id)?.product_id
                        : purchaseBatches.find(b => b.id === alert.batch_id)?.product_id;
                      
                      openModal('waste', {
                        batch_id: alert.batch_id,
                        batch_type: alert.batch_type || 'purchase',
                        product_name: alert.product_name,
                        available_quantity: alert.quantity,
                        product_id: productId
                      });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => clearAlert(alert.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 print-optimize">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <div className="text-3xl font-bold text-blue-600">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 print-optimize">
          <h3 className="text-lg font-semibold mb-2">Active Batches</h3>
          <div className="text-3xl font-bold text-green-600">
            {purchaseBatches.filter(b => b.remaining_portions > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 print-optimize">
          <h3 className="text-lg font-semibold mb-2">Items Wasted (Today)</h3>
          <div className="text-3xl font-bold text-red-600">
            {wasteLog.filter(w => w.date_discarded === new Date().toISOString().split('T')[0]).length}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 print-optimize">
        <h3 className="text-lg font-semibold mb-4">Recent Inventory</h3>
        <div className="space-y-3">
          {purchaseBatches.slice(0, 5).map(batch => {
            const product = batch.product || products.find(p => p.id === batch.product_id);
            return (
              <div key={batch.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{product?.name}</div>
                  <div className="text-sm text-gray-600">
                    {batch.remaining_portions}/{batch.portioned_count} portions remaining
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Expires: {formatDate(batch.best_before_date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={() => openModal('product')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center no-print"
        >
          <Plus className="mr-2 w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden print-optimize">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portion Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.received_state === 'Frozen' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.received_state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.portion_size} {product.portion_unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.received_state === 'Frozen' 
                    ? `${product.shelf_life_thawed} days (thawed)`
                    : `${product.shelf_life_fresh} days (fresh)`
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap no-print">
                  <button
                    onClick={() => openModal('product', product)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InventoryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <button
          onClick={() => openModal('purchase')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center no-print"
        >
          <Package className="mr-2 w-4 h-4" />
          Log Purchase
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden print-optimize">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Before</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchaseBatches.map(batch => {
              const product = batch.product || products.find(p => p.id === batch.product_id);
              const daysUntilExpiry = Math.ceil((new Date(batch.best_before_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={batch.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{product?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(batch.purchase_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getAlertColor(daysUntilExpiry)}`}>
                      {formatDate(batch.best_before_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {batch.remaining_portions}/{batch.portioned_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      batch.remaining_portions === 0 ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {batch.remaining_portions === 0 ? 'Depleted' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap no-print">
                    <button
                      onClick={() => openModal('editPurchase', {
                        ...batch,
                        product_id: batch.product_id
                      })}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit Purchase"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {product?.received_state === 'Frozen' && batch.remaining_portions > 0 && (
                      <button
                        onClick={() => openModal('thaw', { 
                          purchase_batch_id: batch.id, 
                          product_id: batch.product_id,
                          product_name: product?.name,
                          available_portions: batch.remaining_portions 
                        })}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Thaw Portions"
                      >
                        Thaw
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Thawed Items */}
      {thawedBatches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 print-optimize">
          <h3 className="text-lg font-semibold mb-4">Thawed Items</h3>
          <div className="space-y-3">
            {thawedBatches.map(thawBatch => {
              const purchaseBatch = purchaseBatches.find(p => p.id === thawBatch.purchase_batch_id);
              const product = thawBatch.purchase_batch?.product || 
                             purchaseBatch?.product || 
                             products.find(p => p.id === purchaseBatch?.product_id);
              const daysUntilExpiry = Math.ceil((new Date(thawBatch.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={thawBatch.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <div>
                    <div className="font-medium">{product?.name} (Thawed)</div>
                    <div className="text-sm text-gray-600">
                      {thawBatch.remaining_portions}/{thawBatch.portions_thawed} portions • 
                      Thawed: {formatDate(thawBatch.thaw_date)} • 
                      Expires: {formatDate(thawBatch.expiry_date)}
                      {daysUntilExpiry <= 0 && <span className="text-red-500 font-bold"> (EXPIRED)</span>}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${getAlertColor(daysUntilExpiry)}`}>
                    {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const WasteTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Waste Log</h2>
      
      {wasteLog.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No waste logged yet
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden print-optimize">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wasteLog.map(waste => (
                <tr key={waste.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(waste.date_discarded)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{waste.product?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{waste.quantity_discarded} portions</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 capitalize">
                      {waste.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {waste.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Modal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'product':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">
                {formData.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Received State</label>
                <select
                  value={formData.received_state || ''}
                  onChange={(e) => updateFormData('received_state', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select State</option>
                  <option value="Cold">Cold</option>
                  <option value="Frozen">Frozen</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Portion Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.portion_size || ''}
                    onChange={(e) => updateFormData('portion_size', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter portion size"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.portion_unit || ''}
                    onChange={(e) => updateFormData('portion_unit', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="g">grams (g)</option>
                    <option value="unit">units</option>
                    <option value="ml">milliliters (ml)</option>
                  </select>
                </div>
              </div>
              
              {formData.received_state === 'Cold' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Shelf Life Fresh (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shelf_life_fresh || ''}
                    onChange={(e) => setFormData(prev => ({...prev, shelf_life_fresh: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter days"
                    required
                  />
                </div>
              )}
              
              {formData.received_state === 'Frozen' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Shelf Life Thawed (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shelf_life_thawed || ''}
                    onChange={(e) => setFormData(prev => ({...prev, shelf_life_thawed: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter days"
                    required
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.track_by_unit || false}
                  onChange={(e) => setFormData(prev => ({...prev, track_by_unit: e.target.checked}))}
                  className="mr-2"
                />
                <label className="text-sm">Track by individual units (e.g., eggs)</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {formData.id ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          );

        case 'purchase':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Log New Purchase</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={formData.product_id || ''}
                  onChange={(e) => setFormData(prev => ({...prev, product_id: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                    value={formData.purchase_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateFormData('purchase_date', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    pattern="\d{4}-\d{2}-\d{2}"
                    title="Please enter date in YYYY-MM-DD format"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Best Before Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
                    value={formData.best_before_date || ''}
                    onChange={(e) => updateFormData('best_before_date', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    pattern="\d{4}-\d{2}-\d{2}"
                    title="Please enter date in YYYY-MM-DD format"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity_received || ''}
                    onChange={(e) => updateFormData('quantity_received', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.quantity_unit || ''}
                    onChange={(e) => setFormData(prev => ({...prev, quantity_unit: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="g">grams (g)</option>
                    <option value="units">units</option>
                    <option value="ml">milliliters (ml)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Log Purchase
                </button>
              </div>
            </form>
          );

        case 'editPurchase':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Edit Purchase Batch</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium">
                  {products.find(p => p.id === formData.product_id)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  Batch ID: {formData.id}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                    value={formData.purchase_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, purchase_date: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    pattern="\d{4}-\d{2}-\d{2}"
                    title="Please enter date in YYYY-MM-DD format"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Best Before Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
                    value={formData.best_before_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, best_before_date: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    pattern="\d{4}-\d{2}-\d{2}"
                    title="Please enter date in YYYY-MM-DD format"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    value={formData.quantity_received || ''}
                    onChange={(e) => setFormData(prev => ({...prev, quantity_received: parseFloat(e.target.value)}))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.quantity_unit || ''}
                    onChange={(e) => setFormData(prev => ({...prev, quantity_unit: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="g">grams (g)</option>
                    <option value="units">units</option>
                    <option value="ml">milliliters (ml)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Remaining Portions</label>
                <input
                  type="number"
                  value={formData.remaining_portions || ''}
                  onChange={(e) => setFormData(prev => ({...prev, remaining_portions: parseInt(e.target.value)}))}
                  className="w-full border rounded-lg px-3 py-2"
                  min="0"
                  max={formData.portioned_count || 999}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Current total portions: {Math.floor((formData.quantity_received || 0) / 
                    (products.find(p => p.id === formData.product_id)?.portion_size || 1))}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                <strong>Note:</strong> Changing quantity will recalculate total portions. 
                Make sure remaining portions doesn't exceed the new total.
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update Purchase
                </button>
              </div>
            </form>
          );

        case 'thaw':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Thaw Portions</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{formData.product_name}</div>
                <div className="text-sm text-gray-600">
                  Available portions: {formData.available_portions}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Portions to Thaw</label>
                <input
                  type="number"
                  max={formData.available_portions}
                  min="1"
                  value={formData.portions_to_thaw || ''}
                  onChange={(e) => setFormData(prev => ({...prev, portions_to_thaw: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Note: Thawed portions will be calculated to expire based on the product's thawed shelf life.
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Thaw Portions
                </button>
              </div>
            </form>
          );

        case 'waste':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Log Waste/Discard</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="bg-red-50 p-3 rounded">
                <div className="font-medium">{formData.product_name}</div>
                <div className="text-sm text-gray-600">
                  Available to discard: {formData.available_quantity} portions
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Discarded</label>
                <input
                  type="number"
                  max={formData.available_quantity}
                  min="1"
                  value={formData.quantity_discarded || ''}
                  onChange={(e) => setFormData(prev => ({...prev, quantity_discarded: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={formData.reason || ''}
                  onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="expired">Expired</option>
                  <option value="spoiled">Spoiled</option>
                  <option value="contaminated">Contaminated</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Log Waste
                </button>
              </div>
            </form>
          );

        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {renderModalContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">NOODL Tracking</h1>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Print Report
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Eye },
              { key: 'products', label: 'Products', icon: Package },
              { key: 'inventory', label: 'Inventory', icon: Calendar },
              { key: 'waste', label: 'Waste Log', icon: Trash2 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2 w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'waste' && <WasteTab />}
      </main>

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default NOODLTrackingApp;