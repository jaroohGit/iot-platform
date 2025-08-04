<template>
  <div class="products">
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <div class="page-actions">
        <button class="btn-secondary">
          <Filter class="w-4 h-4" />
          Filter
        </button>
        <button class="btn-primary">
          <Plus class="w-4 h-4" />
          Add Product
        </button>
      </div>
    </div>
    
    <!-- Product Grid -->
    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="product-status" :class="product.status.toLowerCase()">
            {{ product.status }}
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-category">{{ product.category }}</p>
          
          <div class="product-stats">
            <div class="stat">
              <span class="stat-label">Price</span>
              <span class="stat-value">${{ product.price }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Stock</span>
              <span class="stat-value">{{ product.stock }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Sales</span>
              <span class="stat-value">{{ product.sales }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="action-btn primary">
              <Edit class="w-4 h-4" />
              Edit
            </button>
            <button class="action-btn secondary">
              <Eye class="w-4 h-4" />
              View
            </button>
            <button class="action-btn danger">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Filter, Plus, Edit, Eye, Trash2 } from 'lucide-vue-next'

export default {
  name: 'Products',
  components: {
    Filter,
    Plus,
    Edit,
    Eye,
    Trash2
  },
  setup() {
    const products = [
      {
        id: 1,
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 299,
        stock: 45,
        sales: 156,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'
      },
      {
        id: 2,
        name: 'Smart Watch',
        category: 'Electronics',
        price: 399,
        stock: 23,
        sales: 89,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop'
      },
      {
        id: 3,
        name: 'Coffee Mug',
        category: 'Home & Garden',
        price: 25,
        stock: 0,
        sales: 234,
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=200&fit=crop'
      },
      {
        id: 4,
        name: 'Laptop Stand',
        category: 'Office',
        price: 79,
        stock: 67,
        sales: 123,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop'
      },
      {
        id: 5,
        name: 'Bluetooth Speaker',
        category: 'Electronics',
        price: 149,
        stock: 12,
        sales: 78,
        status: 'Low Stock',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop'
      },
      {
        id: 6,
        name: 'Desk Lamp',
        category: 'Office',
        price: 89,
        stock: 34,
        sales: 167,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
      }
    ]
    
    return {
      products
    }
  }
}
</script>

<style scoped>
.products {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.product-status.active {
  background: #dcfce7;
  color: #16a34a;
}

.product-status.low.stock {
  background: #fef3c7;
  color: #d97706;
}

.product-status.out.of.stock {
  background: #fee2e2;
  color: #dc2626;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.product-category {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.product-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.danger {
  background: #fee2e2;
  color: #dc2626;
  flex: none;
  width: 40px;
}

.action-btn.danger:hover {
  background: #fecaca;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-actions {
    justify-content: stretch;
  }
  
  .btn-primary, .btn-secondary {
    flex: 1;
    justify-content: center;
  }
}
</style>
