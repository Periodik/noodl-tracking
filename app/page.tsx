'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, AlertTriangle, Package, Trash2, Edit, Eye, X, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  received_state: 'Cold' | 'Frozen';
  portion_size: number;
  portion_unit: string;
  shelf_life_fresh: number;
  shelf_life_thawed: number;
  track_by_unit: boolean;
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
}

interface ThawedBatch {
  id: string;
  purchase_batch_id: string;
  thaw_date: string;
  portions_thawed: number;
  expiry_date: string;
  status: string;
  remaining_portions: number;
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
  product_name: string;
  batch_id: string;
  batch_type?: string;
  date_discarded: string;
  quantity_discarded: number;
  reason: string;
  notes?: string;
}

const NOODLTrackingApp = () => {
  // Initialize with actual ramen shop toppings data
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'prod_001',
      name: 'Mozzarella Cheese',
      received_state: 'Cold',
      portion_size: 25,
      portion_unit: 'g',
      shelf_life_fresh: 7,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_002',
      name: 'American Cheddar',
      received_state: 'Cold',
      portion_size: 25,
      portion_unit: 'g',
      shelf_life_fresh: 25,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_003',
      name: 'Eggs',
      received_state: 'Cold',
      portion_size: 1,
      portion_unit: 'unit',
      shelf_life_fresh: 28,
      shelf_life_thawed: 0,
      track_by_unit: true
    },
    {
      id: 'prod_004',
      name: 'Enoki Mushroom',
      received_state: 'Cold',
      portion_size: 20,
      portion_unit: 'g',
      shelf_life_fresh: 10,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_005',
      name: 'Baby Bok Choy',
      received_state: 'Cold',
      portion_size: 30,
      portion_unit: 'g',
      shelf_life_fresh: 6,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_006',
      name: 'Kimchi',
      received_state: 'Cold',
      portion_size: 25,
      portion_unit: 'g',
      shelf_life_fresh: 180,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_007',
      name: 'Rice Cake',
      received_state: 'Cold',
      portion_size: 2,
      portion_unit: 'unit',
      shelf_life_fresh: 2,
      shelf_life_thawed: 0,
      track_by_unit: true
    },
    {
      id: 'prod_008',
      name: 'Rice (Cooked)',
      received_state: 'Cold',
      portion_size: 50,
      portion_unit: 'g',
      shelf_life_fresh: 4,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_009',
      name: 'Tofu Mi-Ferme',
      received_state: 'Cold',
      portion_size: 40,
      portion_unit: 'g',
      shelf_life_fresh: 6,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_010',
      name: 'Beansprout',
      received_state: 'Cold',
      portion_size: 25,
      portion_unit: 'g',
      shelf_life_fresh: 3,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_011',
      name: 'Ham',
      received_state: 'Cold',
      portion_size: 20,
      portion_unit: 'g',
      shelf_life_fresh: 4,
      shelf_life_thawed: 0,
      track_by_unit: false
    },
    {
      id: 'prod_012',
      name: 'Cooked Chicken',
      received_state: 'Frozen',
      portion_size: 35,
      portion_unit: 'g',
      shelf_life_fresh: 0,
      shelf_life_thawed: 4,
      track_by_unit: false
    },
    {
      id: 'prod_013',
      name: 'Shabu Meat',
      received_state: 'Frozen',
      portion_size: 40,
      portion_unit: 'g',
      shelf_life_fresh: 0,
      shelf_life_thawed: 2,
      track_by_unit: false
    },
    {
      id: 'prod_014',
      name: 'Imitation Crab',
      received_state: 'Frozen',
      portion_size: 25,
      portion_unit: 'g',
      shelf_life_fresh: 0,
      shelf_life_thawed: 4,
      track_by_unit: false
    },
    {
      id: 'prod_015',
      name: 'Bacon Bits',
      received_state: 'Frozen',
      portion_size: 15,
      portion_unit: 'g',
      shelf_life_fresh: 0,
      shelf_life_thawed: 6,
      track_by_unit: false
    },
    {
      id: 'prod_016',
      name: 'Shrimp',
      received_state: 'Frozen',
      portion_size: 6,
      portion_unit: 'unit',
      shelf_life_fresh: 0,
      shelf_life_thawed: 2,
      track_by_unit: true
    },
    {
      id: 'prod_017',
      name: 'Corn',
      received_state: 'Frozen',
      portion_size: 20,
      portion_unit: 'g',
      shelf_life_fresh: 0,
      shelf_life_thawed: 4,
      track_by_unit: false
    }
  ]);

  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([
    {
      id: 'batch_001',
      product_id: 'prod_003',
      purchase_date: '2025-05-15',
      best_before_date: '2025-06-12',
      quantity_received: 24,
      quantity_unit: 'units',
      portioned_count: 24,
      remaining_portions: 20
    },
    {
      id: 'batch_002',
      product_id: 'prod_010',
      purchase_date: '2025-05-30',
      best_before_date: '2025-06-02',
      quantity_received: 250,
      quantity_unit: 'g',
      portioned_count: 10,
      remaining_portions: 8
    },
    {
      id: 'batch_003',
      product_id: 'prod_013',
      purchase_date: '2025-05-28',
      best_before_date: '2025-08-28',
      quantity_received: 800,
      quantity_unit: 'g',
      portioned_count: 20,
      remaining_portions: 18
    },
    {
      id: 'batch_004',
      product_id: 'prod_016',
      purchase_date: '2025-05-29',
      best_before_date: '2025-09-29',
      quantity_received: 60,
      quantity_unit: 'units',
      portioned_count: 10,
      remaining_portions: 10
    }
  ]);

  const [thawedBatches, setThawedBatches] = useState<ThawedBatch[]>([
    {
      id: 'thaw_001',
      purchase_batch_id: 'batch_003',
      thaw_date: '2025-05-30',
      portions_thawed: 2,
      expiry_date: '2025-06-01',
      status: 'active',
      remaining_portions: 1
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wasteLog, setWasteLog] = useState<WasteEntry[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState<any>({});

  // Calculate alerts on component mount and data changes
  useEffect(() => {
    generateAlerts();
  }, [purchaseBatches, thawedBatches]);

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const today = new Date();
    
    // Check purchase batches for best-before dates
    purchaseBatches.forEach(batch => {
      const product = products.find(p => p.id === batch.product_id);
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
      const purchaseBatch = purchaseBatches.find(p => p.id === batch.purchase_batch_id);
      const product = products.find(p => p.id === purchaseBatch?.product_id);
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

  const openModal = (type: string, data: any = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (modalType) {
      case 'product':
        if (formData.id) {
          setProducts(products.map(p => p.id === formData.id ? formData : p));
        } else {
          const newProduct = { ...formData, id: `prod_${Date.now()}` };
          setProducts([...products, newProduct]);
        }
        break;
        
      case 'purchase':
        const portionCount = Math.floor(formData.quantity_received / 
          (products.find(p => p.id === formData.product_id)?.portion_size || 1));
        const newBatch = {
          ...formData,
          id: `batch_${Date.now()}`,
          portioned_count: portionCount,
          remaining_portions: portionCount
        };
        setPurchaseBatches([...purchaseBatches, newBatch]);
        break;
        
      case 'thaw':
        if (formData.portions_to_thaw) {
          const product = products.find(p => p.id === formData.product_id);
          const thawDate = new Date();
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (product?.shelf_life_thawed || 0));
          
          const newThawBatch = {
            id: `thaw_${Date.now()}`,
            purchase_batch_id: formData.batch_id,
            thaw_date: thawDate.toISOString().split('T')[0],
            portions_thawed: parseInt(formData.portions_to_thaw),
            expiry_date: expiryDate.toISOString().split('T')[0],
            status: 'active',
            remaining_portions: parseInt(formData.portions_to_thaw)
          };
          
          setThawedBatches([...thawedBatches, newThawBatch]);
          
          // Update original batch
          setPurchaseBatches(batches => 
            batches.map(b => 
              b.id === formData.batch_id 
                ? { ...b, remaining_portions: b.remaining_portions - parseInt(formData.portions_to_thaw) }
                : b
            )
          );
        }
        break;
        
      case 'waste':
        const wasteEntry = {
          id: `waste_${Date.now()}`,
          ...formData,
          date_discarded: new Date().toISOString().split('T')[0]
        };
        setWasteLog([...wasteLog, wasteEntry]);
        
        // Update batch quantities
        if (formData.batch_type === 'thawed') {
          setThawedBatches(batches =>
            batches.map(b =>
              b.id === formData.batch_id
                ? { ...b, remaining_portions: Math.max(0, b.remaining_portions - parseInt(formData.quantity_discarded)) }
                : b
            )
          );
        } else {
          setPurchaseBatches(batches =>
            batches.map(b =>
              b.id === formData.batch_id
                ? { ...b, remaining_portions: Math.max(0, b.remaining_portions - parseInt(formData.quantity_discarded)) }
                : b
            )
          );
        }
        break;
    }
    
    closeModal();
  };

  const clearAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
                    onClick={() => openModal('waste', {
                      batch_id: alert.batch_id,
                      batch_type: alert.batch_type || 'purchase',
                      product_name: alert.product_name,
                      available_quantity: alert.quantity
                    })}
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
            const product = products.find(p => p.id === batch.product_id);
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
              const product = products.find(p => p.id === batch.product_id);
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
                    {product?.received_state === 'Frozen' && batch.remaining_portions > 0 && (
                      <button
                        onClick={() => openModal('thaw', { 
                          batch_id: batch.id, 
                          product_id: batch.product_id,
                          product_name: product?.name,
                          available_portions: batch.remaining_portions 
                        })}
                        className="text-blue-600 hover:text-blue-900 mr-3"
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
              const product = products.find(p => p.id === purchaseBatch?.product_id);
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
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{waste.product_name}</td>
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
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Received State</label>
                <select
                  value={formData.received_state || ''}
                  onChange={(e) => setFormData({...formData, received_state: e.target.value})}
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
                    value={formData.portion_size || ''}
                    onChange={(e) => setFormData({...formData, portion_size: parseFloat(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.portion_unit || ''}
                    onChange={(e) => setFormData({...formData, portion_unit: e.target.value})}
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
                    value={formData.shelf_life_fresh || ''}
                    onChange={(e) => setFormData({...formData, shelf_life_fresh: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              )}
              
              {formData.received_state === 'Frozen' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Shelf Life Thawed (days)</label>
                  <input
                    type="number"
                    value={formData.shelf_life_thawed || ''}
                    onChange={(e) => setFormData({...formData, shelf_life_thawed: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.track_by_unit || false}
                  onChange={(e) => setFormData({...formData, track_by_unit: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm">Track by individual units (e.g., eggs)</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {formData.id ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          );

        case 'purchase':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Log New Purchase</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={formData.product_id || ''}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
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
                    type="date"
                    value={formData.purchase_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Best Before Date</label>
                  <input
                    type="date"
                    value={formData.best_before_date || ''}
                    onChange={(e) => setFormData({...formData, best_before_date: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    value={formData.quantity_received || ''}
                    onChange={(e) => setFormData({...formData, quantity_received: parseFloat(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={formData.quantity_unit || ''}
                    onChange={(e) => setFormData({...formData, quantity_unit: e.target.value})}
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Log Purchase
                </button>
              </div>
            </form>
          );

        case 'thaw':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Thaw Portions</h2>
              
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
                  onChange={(e) => setFormData({...formData, portions_to_thaw: e.target.value})}
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thaw Portions
                </button>
              </div>
            </form>
          );

        case 'waste':
          return (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Log Waste/Discard</h2>
              
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
                  onChange={(e) => setFormData({...formData, quantity_discarded: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
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