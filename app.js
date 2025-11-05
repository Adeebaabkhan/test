// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, set, update, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase Configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCa4XYpwePgiTWL30sSkIubYbWizTHwEQU",
    authDomain: "maisonetoile-5eee1.firebaseapp.com",
    databaseURL: "https://maisonetoile-5eee1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "maisonetoile-5eee1",
    storageBucket: "maisonetoile-5eee1.firebasestorage.app",
    messagingSenderId: "902250837280",
    appId: "1:902250837280:web:0f61ccce4455ee90fdd345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global Variables
let currentUser = null;
let userData = null;
let products = {};
let sales = {};
let payouts = {};
let users = {};

// ===========================
// AUTHENTICATION & INITIALIZATION
// ===========================

// Check if user is logged in
function checkAuth() {
    currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    userData = {
        username: currentUser,
        name: sessionStorage.getItem('userName'),
        role: sessionStorage.getItem('userRole'),
        commission: parseInt(sessionStorage.getItem('userCommission')),
        avatar: sessionStorage.getItem('userAvatar')
    };
    
    return true;
}

// Logout function
window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
};

// Initialize dashboard
async function initDashboard() {
    if (!checkAuth()) return;
    
    // Update user info in navbar
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userRole').textContent = userData.role === 'owner' ? '👑 Owner' : '🔧 Admin';
    document.getElementById('userAvatar').textContent = userData.avatar;
    
    // Show admin tab if owner
    if (userData.role === 'owner') {
        document.getElementById('adminsTab').style.display = 'block';
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.getElementById('themeSelector').value = savedTheme;
    applyTheme(savedTheme);
    
    // Load all data
    await loadProducts();
    await loadSales();
    await loadPayouts();
    await loadUsers();
    
    // Setup real-time listeners
    setupRealtimeListeners();
    
    // Update stats
    updateStats();
}

// Setup real-time listeners
function setupRealtimeListeners() {
    // Listen to products changes
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
            products = snapshot.val();
            renderProducts();
            updateStats();
            checkLowStock();
        }
    });
    
    // Listen to sales changes
    const salesRef = ref(database, 'sales');
    onValue(salesRef, (snapshot) => {
        if (snapshot.exists()) {
            sales = snapshot.val();
            renderSales();
            updateStats();
        }
    });
    
    // Listen to payouts changes
    const payoutsRef = ref(database, 'payouts');
    onValue(payoutsRef, (snapshot) => {
        if (snapshot.exists()) {
            payouts = snapshot.val();
            renderPayouts();
        }
    });
    
    // Listen to users changes (owner only)
    if (userData.role === 'owner') {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                users = snapshot.val();
                renderAdmins();
            }
        });
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Get current date/time in UTC format: YYYY-MM-DD HH:MM:SS
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Format currency
function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toastIcon.textContent = icons[type] || icons.success;
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===========================
// THEME MANAGEMENT
// ===========================

// Apply theme
function applyTheme(theme) {
    document.body.className = theme !== 'default' ? `theme-${theme}` : '';
    localStorage.setItem('theme', theme);
}

// Theme selector change
document.getElementById('themeSelector').addEventListener('change', (e) => {
    applyTheme(e.target.value);
});

// ===========================
// TAB MANAGEMENT
// ===========================

window.switchTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all tab buttons
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Set active button
    event.target.classList.add('active');
};

// ===========================
// PRODUCTS MANAGEMENT
// ===========================

// Load products from Firebase
async function loadProducts() {
    try {
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
            products = snapshot.val();
            renderProducts();
        } else {
            products = {};
            renderProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Render products grid
function renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (Object.keys(products).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No products yet</div>
                <button class="btn btn-primary" onclick="openAddProductModal()">+ Add Your First Product</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    for (const [productId, product] of Object.entries(products)) {
        const stockClass = product.stock < 5 ? 'low' : '';
        const categoryBadge = product.category ? `<span class="badge badge-primary">${product.category === 'solo' ? '👤 Solo' : '🤝 Shared'}</span>` : '';
        
        html += `
            <div class="product-card">
                <div class="product-emoji">${product.emoji || '📦'}</div>
                <div class="product-name">${product.name}</div>
                ${categoryBadge}
                <div class="product-category">${product.duration || ''}</div>
                <div class="product-stock ${stockClass}">${product.stock}</div>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-sm btn-primary" onclick="updateStock('${productId}', 1)">+</button>
                    <button class="btn btn-sm btn-danger" onclick="updateStock('${productId}', -1)">-</button>
                    ${userData.role === 'owner' ? `<button class="btn btn-sm btn-warning" onclick="editProduct('${productId}')">✏️</button>` : ''}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Open add product modal
window.openAddProductModal = function() {
    const modalHTML = `
        <div class="modal active" id="productModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">📦 Add New Product</h3>
                    <button class="close-btn" onclick="closeModal('productModal')">&times;</button>
                </div>
                <form id="productForm" onsubmit="saveProduct(event)">
                    <div class="form-group">
                        <label>Product Name *</label>
                        <input type="text" class="form-control" id="productName" required placeholder="e.g. Netflix">
                    </div>
                    
                    <div class="form-group">
                        <label>Emoji Icon</label>
                        <input type="text" class="form-control" id="productEmoji" placeholder="🎬" maxlength="2">
                    </div>
                    
                    <div class="form-group">
                        <label>Duration</label>
                        <select class="form-control" id="productDuration">
                            <option value="1 Month">1 Month</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="1 Year">1 Year</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Category (for Netflix & CapCut only)</label>
                        <select class="form-control" id="productCategory">
                            <option value="">No Category</option>
                            <option value="solo">👤 Solo Only</option>
                            <option value="shared">🤝 Shared Only</option>
                            <option value="both">👤🤝 Both (Creates 2 products)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Price (₱) *</label>
                        <input type="number" class="form-control" id="productPrice" required min="0" step="0.01" placeholder="200.00">
                    </div>
                    
                    <div class="form-group">
                        <label>Cost (₱) *</label>
                        <input type="number" class="form-control" id="productCost" required min="0" step="0.01" placeholder="150.00">
                    </div>
                    
                    <div class="form-group">
                        <label>Initial Stock *</label>
                        <input type="number" class="form-control" id="productStock" required min="0" value="10">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save Product</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Save product
window.saveProduct = async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const emoji = document.getElementById('productEmoji').value.trim() || '📦';
    const duration = document.getElementById('productDuration').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const cost = parseFloat(document.getElementById('productCost').value);
    const stock = parseInt(document.getElementById('productStock').value);
    
    try {
        const productsRef = ref(database, 'products');
        
        if (category === 'both') {
            // Create two products - Solo and Shared
            const soloProduct = {
                name: `${name} ${duration}`,
                emoji: emoji,
                category: 'solo',
                duration: duration,
                price: price,
                cost: cost,
                profit: price - cost,
                stock: stock,
                created_by: currentUser,
                created_at: getCurrentDateTime()
            };
            
            const sharedProduct = {
                name: `${name} ${duration}`,
                emoji: emoji,
                category: 'shared',
                duration: duration,
                price: price * 0.6, // 40% discount for shared
                cost: cost,
                profit: (price * 0.6) - cost,
                stock: stock,
                created_by: currentUser,
                created_at: getCurrentDateTime()
            };
            
            await push(productsRef, soloProduct);
            await push(productsRef, sharedProduct);
            
            showToast('2 products created successfully!', 'success');
        } else {
            // Create single product
            const newProduct = {
                name: `${name} ${duration}`,
                emoji: emoji,
                category: category || null,
                duration: duration,
                price: price,
                cost: cost,
                profit: price - cost,
                stock: stock,
                created_by: currentUser,
                created_at: getCurrentDateTime()
            };
            
            await push(productsRef, newProduct);
            showToast('Product added successfully!', 'success');
        }
        
        closeModal('productModal');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Failed to save product', 'error');
    }
};

// Update stock
window.updateStock = async function(productId, change) {
    const product = products[productId];
    const newStock = product.stock + change;
    
    if (newStock < 0) {
        showToast('Stock cannot be negative', 'warning');
        return;
    }
    
    try {
        const productRef = ref(database, `products/${productId}`);
        await update(productRef, {
            stock: newStock,
            updated_at: getCurrentDateTime(),
            updated_by: currentUser
        });
        
        showToast(`Stock updated to ${newStock}`, 'success');
    } catch (error) {
        console.error('Error updating stock:', error);
        showToast('Failed to update stock', 'error');
    }
};

// Check low stock
function checkLowStock() {
    const lowStockProducts = Object.entries(products).filter(([id, product]) => product.stock < 5);
    
    const alertDiv = document.getElementById('lowStockAlert');
    
    if (lowStockProducts.length > 0) {
        let alertHTML = '<div class="alert alert-warning"><strong>⚠️ Low Stock Alert:</strong><br>';
        lowStockProducts.forEach(([id, product]) => {
            const categoryText = product.category ? ` (${product.category === 'solo' ? '👤 Solo' : '🤝 Shared'})` : '';
            alertHTML += `• ${product.emoji} ${product.name}${categoryText}: ${product.stock} left<br>`;
        });
        alertHTML += '</div>';
        alertDiv.innerHTML = alertHTML;
    } else {
        alertDiv.innerHTML = '';
    }
}

// ===========================
// SALES MANAGEMENT
// ===========================

// Load sales from Firebase
async function loadSales() {
    try {
        const salesRef = ref(database, 'sales');
        const snapshot = await get(salesRef);
        
        if (snapshot.exists()) {
            sales = snapshot.val();
            renderSales();
        } else {
            sales = {};
            renderSales();
        }
    } catch (error) {
        console.error('Error loading sales:', error);
        showToast('Failed to load sales', 'error');
    }
}

// Render sales table
function renderSales() {
    const tbody = document.getElementById('salesTableBody');
    
    if (Object.keys(sales).length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <div class="empty-state-text">No sales recorded yet</div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    // Sort sales by date (newest first)
    const sortedSales = Object.entries(sales).sort((a, b) => {
        return new Date(b[1].sold_at) - new Date(a[1].sold_at);
    });
    
    sortedSales.forEach(([saleId, sale]) => {
        const product = products[sale.product_id];
        if (!product) return;
        
        const categoryBadge = product.category ? `<span class="badge badge-primary">${product.category === 'solo' ? '👤 Solo' : '🤝 Shared'}</span>` : '-';
        
        html += `
            <tr>
                <td>${sale.sold_at}</td>
                <td>${product.emoji} ${product.name}</td>
                <td>${categoryBadge}</td>
                <td>${sale.account_sold}</td>
                <td>${formatCurrency(sale.price)}</td>
                <td>${formatCurrency(sale.profit)}</td>
                <td>${formatCurrency(sale.commission)}</td>
                <td>${users[sale.sold_by]?.name || sale.sold_by}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editSale('${saleId}')">✏️</button>
                    ${userData.role === 'owner' ? `<button class="btn btn-sm btn-danger" onclick="deleteSale('${saleId}')">🗑️</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Open record sale modal
window.openRecordSaleModal = function() {
    let productOptions = '';
    
    for (const [productId, product] of Object.entries(products)) {
        if (product.stock > 0) {
            const categoryText = product.category ? ` - ${product.category === 'solo' ? '👤 Solo' : '🤝 Shared'}` : '';
            productOptions += `<option value="${productId}">${product.emoji} ${product.name}${categoryText} (${product.stock} available)</option>`;
        }
    }
    
    if (!productOptions) {
        showToast('No products available in stock', 'warning');
        return;
    }
    
    const modalHTML = `
        <div class="modal active" id="saleModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">💰 Record Sale</h3>
                    <button class="close-btn" onclick="closeModal('saleModal')">&times;</button>
                </div>
                <form id="saleForm" onsubmit="saveSale(event)">
                    <div class="form-group">
                        <label>Product *</label>
                        <select class="form-control" id="saleProduct" required onchange="updateSalePrice()">
                            <option value="">Select Product</option>
                            ${productOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Account Sold (Email/Username) *</label>
                        <input type="text" class="form-control" id="saleAccount" required placeholder="e.g. netflix_acc_15@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Price (₱)</label>
                        <input type="number" class="form-control" id="salePrice" readonly style="background: #f3f4f6;">
                    </div>
                    
                    <div class="form-group">
                        <label>Your Commission (₱)</label>
                        <input type="number" class="form-control" id="saleCommission" readonly style="background: #f3f4f6;">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Record Sale & Get Commission</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Update sale price when product selected
window.updateSalePrice = function() {
    const productId = document.getElementById('saleProduct').value;
    const product = products[productId];
    
    if (product) {
        document.getElementById('salePrice').value = product.price.toFixed(2);
        
        // Calculate commission
        const profit = product.profit;
        const commissionPercent = userData.commission;
        const commission = (profit * commissionPercent) / 100;
        
        document.getElementById('saleCommission').value = commission.toFixed(2);
    }
};

// Save sale
window.saveSale = async function(event) {
    event.preventDefault();
    
    const productId = document.getElementById('saleProduct').value;
    const accountSold = document.getElementById('saleAccount').value.trim();
    const product = products[productId];
    
    if (!product) {
        showToast('Invalid product selected', 'error');
        return;
    }
    
    if (product.stock < 1) {
        showToast('Product out of stock', 'warning');
        return;
    }
    
    try {
        // Calculate values
        const profit = product.profit;
        const adminCommission = (profit * userData.commission) / 100;
        const ownerCommission = profit - adminCommission;
        
        // Create sale record
        const newSale = {
            product_id: productId,
            account_sold: accountSold,
            price: product.price,
            cost: product.cost,
            profit: profit,
            commission: adminCommission,
            owner_commission: ownerCommission,
            sold_by: currentUser,
            sold_at: getCurrentDateTime(),
            payout_status: 'pending'
        };
        
        // Save to database
        const salesRef = ref(database, 'sales');
        await push(salesRef, newSale);
        
        // Update product stock
        const productRef = ref(database, `products/${productId}`);
        await update(productRef, {
            stock: product.stock - 1,
            updated_at: getCurrentDateTime()
        });
        
        showToast(`Sale recorded! Your commission: ${formatCurrency(adminCommission)}`, 'success');
        closeModal('saleModal');
    } catch (error) {
        console.error('Error saving sale:', error);
        showToast('Failed to record sale', 'error');
    }
};

// Edit sale (update account sold)
window.editSale = function(saleId) {
    const sale = sales[saleId];
    
    const modalHTML = `
        <div class="modal active" id="editSaleModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">✏️ Edit Sale</h3>
                    <button class="close-btn" onclick="closeModal('editSaleModal')">&times;</button>
                </div>
                <form onsubmit="updateSaleAccount(event, '${saleId}')">
                    <div class="form-group">
                        <label>Account Sold (Email/Username) *</label>
                        <input type="text" class="form-control" id="editAccount" value="${sale.account_sold}" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Update Account</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Update sale account
window.updateSaleAccount = async function(event, saleId) {
    event.preventDefault();
    
    const newAccount = document.getElementById('editAccount').value.trim();
    
    try {
        const saleRef = ref(database, `sales/${saleId}`);
        await update(saleRef, {
            account_sold: newAccount,
            edited_at: getCurrentDateTime(),
            edited_by: currentUser
        });
        
        showToast('Account updated successfully!', 'success');
        closeModal('editSaleModal');
    } catch (error) {
        console.error('Error updating sale:', error);
        showToast('Failed to update sale', 'error');
    }
};

// Delete sale (owner only)
window.deleteSale = async function(saleId) {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    try {
        const saleRef = ref(database, `sales/${saleId}`);
        await remove(saleRef);
        
        showToast('Sale deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting sale:', error);
        showToast('Failed to delete sale', 'error');
    }
};

// ===========================
// PAYOUTS MANAGEMENT
// ===========================

// Load payouts
async function loadPayouts() {
    try {
        const payoutsRef = ref(database, 'payouts');
        const snapshot = await get(payoutsRef);
        
        if (snapshot.exists()) {
            payouts = snapshot.val();
            renderPayouts();
        } else {
            payouts = {};
            renderPayouts();
        }
    } catch (error) {
        console.error('Error loading payouts:', error);
    }
}

// Render payouts
function renderPayouts() {
    const container = document.getElementById('payoutsContainer');
    
    // Calculate pending commission
    let pendingCommission = 0;
    let pendingSalesCount = 0;
    
    Object.values(sales).forEach(sale => {
        if (sale.payout_status === 'pending' && sale.sold_by === currentUser) {
            pendingCommission += sale.commission;
            pendingSalesCount++;
        }
    });
    
    // Get payout history for current user
    const userPayouts = Object.entries(payouts).filter(([id, payout]) => payout.user_id === currentUser);
    
    let html = `
        <div class="section">
            <h3>💸 Pending Commission</h3>
            <div class="stat-value">${formatCurrency(pendingCommission)}</div>
            <p style="color: #6b7280; margin-top: 10px;">${pendingSalesCount} sales pending payout</p>
        </div>
        
        <div class="section" style="margin-top: 20px;">
            <h3>📜 Payout History</h3>
    `;
    
    if (userPayouts.length === 0) {
        html += `<p style="color: #6b7280; margin-top: 15px;">No payouts yet</p>`;
    } else {
        html += '<div class="table-container"><table><thead><tr><th>📅 Date</th><th>💰 Amount</th><th>📊 Sales Count</th><th>📅 Period</th></tr></thead><tbody>';
        
        userPayouts.reverse().forEach(([id, payout]) => {
            html += `
                <tr>
                    <td>${payout.paid_at}</td>
                    <td>${formatCurrency(payout.amount)}</td>
                    <td>${payout.sales_count}</td>
                    <td>${payout.period_start} to ${payout.period_end}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}

// Mark as paid and reset (Owner only)
window.markAsPaid = async function() {
    if (userData.role !== 'owner') {
        showToast('Only owner can mark payouts', 'warning');
        return;
    }
    
    if (!confirm('Mark all pending commissions as paid and reset? This will archive sales and start fresh.')) return;
    
    try {
        // Get all pending sales grouped by user
        const pendingSalesByUser = {};
        
        Object.entries(sales).forEach(([saleId, sale]) => {
            if (sale.payout_status === 'pending') {
                if (!pendingSalesByUser[sale.sold_by]) {
                    pendingSalesByUser[sale.sold_by] = {
                        sales: [],
                        totalCommission: 0,
                        count: 0
                    };
                }
                
                pendingSalesByUser[sale.sold_by].sales.push(saleId);
                pendingSalesByUser[sale.sold_by].totalCommission += sale.commission;
                pendingSalesByUser[sale.sold_by].count++;
            }
        });
        
        // Create payout records for each user
        const payoutsRef = ref(database, 'payouts');
        const currentDate = getCurrentDateTime();
        
        for (const [userId, data] of Object.entries(pendingSalesByUser)) {
            const payoutRecord = {
                user_id: userId,
                amount: data.totalCommission,
                sales_count: data.count,
                period_start: data.sales[0] ? sales[data.sales[0]].sold_at.split(' ')[0] : currentDate.split(' ')[0],
                period_end: currentDate.split(' ')[0],
                paid_at: currentDate,
                paid_by: currentUser
            };
            
            await push(payoutsRef, payoutRecord);
            
            // Mark sales as paid
            for (const saleId of data.sales) {
                const saleRef = ref(database, `sales/${saleId}`);
                await update(saleRef, {
                    payout_status: 'paid',
                    paid_at: currentDate
                });
            }
        }
        
        showToast('All payouts marked as paid and archived!', 'success');
        loadPayouts();
        loadSales();
    } catch (error) {
        console.error('Error marking payouts:', error);
        showToast('Failed to process payouts', 'error');
    }
};

// ===========================
// USERS/ADMINS MANAGEMENT
// ===========================

// Load users
async function loadUsers() {
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            users = snapshot.val();
            if (userData.role === 'owner') {
                renderAdmins();
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Render admins table (owner only)
function renderAdmins() {
    const tbody = document.getElementById('adminsTableBody');
    
    let html = '';
    
    Object.entries(users).forEach(([username, user]) => {
        html += `
            <tr>
                <td>${user.avatar || '👤'} ${username}</td>
                <td>${user.name}</td>
                <td><span class="badge ${user.role === 'owner' ? 'badge-warning' : 'badge-primary'}">${user.role === 'owner' ? '👑 Owner' : '🔧 Admin'}</span></td>
                <td>${user.commission}%</td>
                <td>${user.created_at}</td>
                <td>
                    ${user.role !== 'owner' ? `
                        <button class="btn btn-sm btn-warning" onclick="editAdmin('${username}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAdmin('${username}')">🗑️</button>
                    ` : '-'}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Open add admin modal (owner only)
window.openAddAdminModal = function() {
    const modalHTML = `
        <div class="modal active" id="adminModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">👥 Add New Admin</h3>
                    <button class="close-btn" onclick="closeModal('adminModal')">&times;</button>
                </div>
                <form onsubmit="saveAdmin(event)">
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" class="form-control" id="adminUsername" required placeholder="john_doe">
                    </div>
                    
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" class="form-control" id="adminName" required placeholder="John Doe">
                    </div>
                    
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="password" class="form-control" id="adminPassword" required placeholder="Secure password">
                    </div>
                    
                    <div class="form-group">
                        <label>Commission % *</label>
                        <input type="number" class="form-control" id="adminCommission" required min="0" max="100" value="20">
                    </div>
                    
                    <div class="form-group">
                        <label>Avatar Emoji</label>
                        <input type="text" class="form-control" id="adminAvatar" placeholder="👤" maxlength="2">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Create Admin Account</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Save admin
window.saveAdmin = async function(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim().toLowerCase();
    const name = document.getElementById('adminName').value.trim();
    const password = document.getElementById('adminPassword').value;
    const commission = parseInt(document.getElementById('adminCommission').value);
    const avatar = document.getElementById('adminAvatar').value.trim() || '👤';
    
    // Check if username exists
    if (users[username]) {
        showToast('Username already exists', 'error');
        return;
    }
    
    try {
        const newAdmin = {
            name: name,
            password: btoa(password),
            role: 'admin',
            commission: commission,
            avatar: avatar,
            created_at: getCurrentDateTime(),
            created_by: currentUser
        };
        
        const adminRef = ref(database, `users/${username}`);
        await set(adminRef, newAdmin);
        
        showToast(`Admin ${name} created successfully!`, 'success');
        closeModal('adminModal');
    } catch (error) {
        console.error('Error creating admin:', error);
        showToast('Failed to create admin', 'error');
    }
};

// Delete admin (owner only)
window.deleteAdmin = async function(username) {
    if (!confirm(`Delete admin ${username}? This action cannot be undone.`)) return;
    
    try {
        const adminRef = ref(database, `users/${username}`);
        await remove(adminRef);
        
        showToast('Admin deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting admin:', error);
        showToast('Failed to delete admin', 'error');
    }
};

// ===========================
// STATS UPDATE
// ===========================

function updateStats() {
    // Total sales count
    const totalSalesCount = Object.keys(sales).length;
    document.getElementById('statTotalSales').textContent = totalSalesCount;
    
    // Products sold
    document.getElementById('statProductsSold').textContent = totalSalesCount;
    
    // Total revenue
    let totalRevenue = 0;
    Object.values(sales).forEach(sale => {
        totalRevenue += sale.price;
    });
    document.getElementById('statRevenue').textContent = formatCurrency(totalRevenue);
    
    // Total stock
    let totalStock = 0;
    Object.values(products).forEach(product => {
        totalStock += product.stock;
    });
    document.getElementById('statStock').textContent = totalStock;
    
    // User commission (pending)
    let userCommission = 0;
    Object.values(sales).forEach(sale => {
        if (sale.payout_status === 'pending' && sale.sold_by === currentUser) {
            userCommission += sale.commission;
        }
    });
    document.getElementById('statCommission').textContent = formatCurrency(userCommission);
    
    // Total profit
    let totalProfit = 0;
    Object.values(sales).forEach(sale => {
        totalProfit += sale.profit;
    });
    document.getElementById('statProfit').textContent = formatCurrency(totalProfit);
}

// ===========================
// MODAL HELPERS
// ===========================

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

// ===========================
// INITIALIZE ON PAGE LOAD
// ===========================

window.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});
