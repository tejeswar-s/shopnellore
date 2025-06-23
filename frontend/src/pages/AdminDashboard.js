import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product management
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    brand: '',
    category: '',
    countInStock: '',
    defaultRating: 5,
    defaultComment: 'Great product!'
  });

  // User management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    isAdmin: false,
    address: '',
    phone: ''
  });

  // Add state for image uploading
  const [uploading, setUploading] = useState(false);

  // Order management
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // New state for categories
  const [categories, setCategories] = useState([]);

  // New state for cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users')
      ]);
      const productsData = Array.isArray(productsRes.data.products)
        ? productsRes.data.products
        : Array.isArray(productsRes.data)
          ? productsRes.data
          : [];
      setProducts(productsData);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return [address.street, address.city, address.state, address.postalCode, address.country]
      .filter(Boolean)
      .join(', ');
  };

  // Product Management
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!productForm.name || !productForm.price || !productForm.description || !productForm.image || !productForm.brand || !productForm.category || !productForm.countInStock) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productForm);
        setSuccess('Product updated successfully');
      } else {
        await api.post('/products', {
          ...productForm,
          defaultRating: productForm.defaultRating,
          defaultComment: productForm.defaultComment
        });
        setSuccess('Product created successfully');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      brand: product.brand,
      category: product.category,
      countInStock: product.countInStock,
      defaultRating: product.defaultRating,
      defaultComment: product.defaultComment
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        setSuccess('Product deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      image: '',
      brand: '',
      category: '',
      countInStock: '',
      defaultRating: 5,
      defaultComment: 'Great product!'
    });
  };

  // User Management
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, userForm);
        setSuccess('User updated successfully');
      }
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      fetchData();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      address: user.address || '',
      phone: user.phone || ''
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        setSuccess('User removed successfully');
        fetchData();
      } catch (err) {
        setError('Failed to remove user');
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      isAdmin: false,
      address: '',
      phone: ''
    });
  };

  // Order Management
  const handleOrderStatusChange = async (orderId, status) => {
    try {
      if (status === 'delivered') {
        const response = await api.put(`/orders/${orderId}/status`, { 
          status: 'delivered' 
        });
        if (response.data) {
          setSuccess('Order marked as delivered');
          await fetchData(); // Refresh the data
        }
      } else if (status === 'cancelled') {
        if (!cancelReason.trim()) {
          setError('Please provide a reason for cancellation');
          return;
        }
        const response = await api.put(`/orders/${orderId}/status`, { 
          status: 'cancelled', 
          cancelReason 
        });
        if (response.data) {
          setSuccess('Order cancelled successfully');
          setShowCancelModal(false);
          setCancelOrderId(null);
          setCancelReason('');
          await fetchData(); // Refresh the data
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (order) => {
    const status = order?.status || 'pending';
    switch (status) {
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'paid':
        return <Badge bg="warning">Paid</Badge>;
      case 'pending':
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  // Add image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await api.post('/products/upload', formData, config);
      setProductForm((prev) => ({ ...prev, image: data.image }));
      setUploading(false);
    } catch (error) {
      setError('Image upload failed');
      setUploading(false);
    }
  };

  // Prepare sales analytics data
  const salesByMonth = Array(12).fill(0);
  orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    salesByMonth[month] += order.totalPrice;
  });
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: 'Sales (₹)',
      data: salesByMonth,
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
      borderRadius: 8,
    }],
  };
  const orderStatusCounts = { Delivered: 0, Paid: 0, Pending: 0 };
  orders.forEach(order => {
    if (order.isDelivered) orderStatusCounts.Delivered++;
    else if (order.isPaid) orderStatusCounts.Paid++;
    else orderStatusCounts.Pending++;
  });

  // Stats calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.totalPrice : 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

  // Most popular product (by quantity sold)
  const productSales = products.map(product => {
    const sold = orders.reduce((sum, o) => {
      const item = o.orderItems?.find(i => i.product === product._id || i.product?._id === product._id);
      return sum + (item ? item.qty || item.quantity || 0 : 0);
    }, 0);
    return { ...product, sold };
  });
  const mostPopularProduct = productSales.sort((a, b) => b.sold - a.sold)[0];

  // Revenue by day (last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0,0,0,0);
    return d;
  });
  const revenueByDay = last7Days.map(day => {
    const dayStr = day.toLocaleDateString();
    const revenue = orders.filter(o => {
      const od = new Date(o.createdAt);
      od.setHours(0,0,0,0);
      return od.getTime() === day.getTime() && o.status === 'delivered';
    }).reduce((sum, o) => sum + o.totalPrice, 0);
    return { day: dayStr, revenue };
  });
  const revenueChartData = {
    labels: revenueByDay.map(d => d.day),
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueByDay.map(d => d.revenue),
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
      borderRadius: 8,
    }],
  };

  // Stats calculations
  const topProducts = [...products].sort((a, b) => b.numReviews - a.numReviews).slice(0, 3);
  const topUsers = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  // Orders date filtering
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    let statusMatch =
      orderStatusFilter === 'All' ||
      (orderStatusFilter === 'Delivered' && (order.status === 'delivered' || order.isDelivered)) ||
      (orderStatusFilter === 'Cancelled' && order.status === 'cancelled') ||
      (orderStatusFilter === 'Paid' && order.status === 'paid') ||
      (orderStatusFilter === 'Pending' && order.status === 'pending');
    let dateMatch = true;
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      const orderDate = new Date(order.createdAt);
      fromDate.setHours(0,0,0,0);
      orderDate.setHours(0,0,0,0);
      dateMatch = dateMatch && orderDate >= fromDate;
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23,59,59,999);
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0,0,0,0);
      dateMatch = dateMatch && orderDate <= toDate;
    }
    return statusMatch && dateMatch;
  });

  // 1. Order actions logic
  const getOrderActions = (order) => {
    const status = order?.status || 'pending';
    
    if (status === 'pending') {
      return (
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            size="sm" 
            onClick={() => handleOrderStatusChange(order._id, 'delivered')}
          >
            Mark as Delivered
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => { 
              setCancelOrderId(order._id); 
              setShowCancelModal(true); 
            }}
          >
            Cancel Order
          </Button>
        </div>
      );
    }
    
    // For non-pending orders, show their status as a badge
    return (
      <Badge 
        bg={status === 'delivered' ? 'success' : 'danger'} 
        className="px-3 py-2"
      >
        {status === 'delivered' ? 'Delivered' : 'Cancelled'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <div className="admin-icon me-3">
                <UserIcon style={{ width: '32px', height: '32px' }} />
              </div>
              <div>
                <h1 className="h2 mb-0 fw-bold gradient-text">Admin Dashboard</h1>
                <p className="text-muted mb-0">Manage products, orders, and users</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4 g-4">
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm stat-card text-center">
              <Card.Body>
                <h6 className="text-muted">Total Sales</h6>
                <h2 className="fw-bold text-success">₹{totalSales.toLocaleString()}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm stat-card text-center">
              <Card.Body>
                <h6 className="text-muted">Average Order Value</h6>
                <h2 className="fw-bold text-primary">₹{averageOrderValue}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm stat-card text-center">
              <Card.Body>
                <h6 className="text-muted">Total Users</h6>
                <h2 className="fw-bold text-info">{users.length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm stat-card text-center">
              <Card.Body>
                <h6 className="text-muted">Most Popular Product</h6>
                <h5 className="fw-bold">{mostPopularProduct?.name || 'N/A'}</h5>
                <div className="text-muted">{mostPopularProduct?.sold || 0} sold</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4 g-4">
          <Col md={6}>
            <Card className="shadow-sm stat-card">
              <Card.Body>
                <h6 className="fw-bold mb-3">Revenue by Day (Last 7 Days)</h6>
                <Bar data={revenueChartData} options={{ plugins: { legend: { display: false } } }} height={120} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm stat-card">
              <Card.Body>
                <h6 className="fw-bold mb-3">Sales Trend (Monthly)</h6>
                <Bar data={barData} options={{ plugins: { legend: { display: false } } }} height={120} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Top Products/Users */}
        <Row className="mb-4 g-4">
          <Col md={6}>
            <Card className="shadow-sm stat-card">
              <Card.Body>
                <h6 className="fw-bold mb-3">Top Products (by Reviews)</h6>
                <ul className="list-group list-group-flush">
                  {topProducts.map(p => (
                    <li key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{p.name}</span>
                      <Badge bg="info">{p.numReviews} reviews</Badge>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm stat-card">
              <Card.Body>
                <h6 className="fw-bold mb-3">Newest Users</h6>
                <ul className="list-group list-group-flush">
                  {topUsers.map(u => (
                    <li key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{u.name}</span>
                      <Badge bg="secondary">{new Date(u.createdAt).toLocaleDateString()}</Badge>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Nav variant="tabs" className="border-0" activeKey={activeTab} onSelect={setActiveTab}>
              <Nav.Item>
                <Nav.Link eventKey="products" className="border-0">
                  <ShoppingBagIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                  Products
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="orders" className="border-0">
                  <ShoppingCartIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                  Orders
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users" className="border-0">
                  <UserIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                  Users
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="p-4">
              {/* Products Tab */}
              <Tab.Pane active={activeTab === 'products'}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Product Management</h4>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                      setShowProductModal(true);
                    }}
                  >
                    <PlusIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                    Add Product
                  </Button>
                </div>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(products) ? products : []).map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.image && product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="rounded"
                            loading="lazy"
                            width={50}
                            height={50}
                            srcSet={product.image && product.image.startsWith('http') ? `${product.image}?w=50 50w, ${product.image}?w=100 100w` : ''}
                            sizes="50px"
                            onError={e => e.target.src = '/default-product.png'}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>₹{product.price}</td>
                        <td>{product.category}</td>
                        <td>
                          <Badge bg={product.countInStock > 0 ? 'success' : 'danger'}>
                            {product.countInStock}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditProduct(product)}
                          >
                            <PencilIcon style={{ width: '16px', height: '16px' }} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <TrashIcon style={{ width: '16px', height: '16px' }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>

              {/* Orders Tab */}
              <Tab.Pane active={activeTab === 'orders'}>
                <h4 className="mb-3">Order Management</h4>
                <Row className="mb-3">
                  <Col md={4} className="mb-2 mb-md-0">
                    <Form.Select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                      <option value="All">All Statuses</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </Form.Select>
                  </Col>
                  <Col md={4} className="mb-2 mb-md-0">
                    <Form.Control type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} placeholder="From" />
                  </Col>
                  <Col md={4}>
                    <Form.Control type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} placeholder="To" />
                  </Col>
                </Row>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <ShoppingCartIcon style={{ width: '64px', height: '64px' }} className="text-muted mb-3" />
                    <h5>No Orders Found</h5>
                    <p className="text-muted">Try adjusting your filters.</p>
                  </div>
                ) : (
                  <>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user?.name || 'N/A'}</td>
                            <td>₹{order.totalPrice}</td>
                            <td>{getStatusBadge(order)}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              {getOrderActions(order)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Button variant="secondary" size="sm" onClick={() => setDateRange({ from: '', to: '' })}>Clear Filter</Button>
                  </>
                )}
                {/* Cancel Modal */}
                <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Cancel Order</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form.Group>
                      <Form.Label>Reason for cancellation</Form.Label>
                      <Form.Control as="textarea" rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} required />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
                    <Button variant="danger" onClick={() => handleOrderStatusChange(cancelOrderId, 'cancelled')} disabled={!cancelReason.trim()}>Cancel Order</Button>
                  </Modal.Footer>
                </Modal>
              </Tab.Pane>

              {/* Users Tab */}
              <Tab.Pane active={activeTab === 'users'}>
                <h4 className="mb-3">User Management</h4>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Admin</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.isAdmin ? <Badge bg="success">Yes</Badge> : <Badge bg="danger">No</Badge>}</td>
                        <td>{formatAddress(user.address)}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <Button variant="light" size="sm" onClick={() => handleEditUser(user)}>
                            <PencilIcon style={{ width: '16px', height: '16px' }} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user._id)}>
                            <TrashIcon style={{ width: '16px', height: '16px' }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Container>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProductSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploading && <div className="text-primary mt-2">Uploading...</div>}
                  {productForm.image && (
                    <div className="mt-2">
                      <img
                        src={productForm.image && productForm.image.startsWith('http') ? productForm.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${productForm.image}`}
                        alt="Preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                        onError={e => e.target.src = '/default-product.png'}
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={productForm.category}
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Count</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.countInStock}
                    onChange={(e) => setProductForm({...productForm, countInStock: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Rating</Form.Label>
                  <Form.Select value={productForm.defaultRating} onChange={e => setProductForm(f => ({ ...f, defaultRating: Number(e.target.value) }))} required>
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Review Comment</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.defaultComment}
                    onChange={e => setProductForm(f => ({ ...f, defaultComment: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Street, City, State, Zip, Country"
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              label="Is Admin"
              checked={userForm.isAdmin}
              onChange={(e) => setUserForm({ ...userForm, isAdmin: e.target.checked })}
            />
            <Button variant="primary" type="submit" className="mt-3">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .admin-dashboard {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }
        .admin-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gradient-text {
          background: linear-gradient(90deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 1rem 1.5rem;
        }
        .nav-tabs .nav-link.active {
          color: #667eea;
          background: none;
          border-bottom: 3px solid #667eea;
        }
        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
        }
        .btn-outline-primary:hover, .btn-outline-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 