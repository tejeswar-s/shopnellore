import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Table, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { UserIcon, ShoppingCartIcon, PencilIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Helmet } from 'react-helmet-async';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileImage: user?.profileImage || ''
  });

  // Order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/myorders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare address as object if needed
      let address = profileForm.address;
      if (typeof address === 'string') {
        address = { street: address };
      }
      await updateProfile({
        name: profileForm.name || user?.name,
        phone: profileForm.phone || user?.phone,
        address: address || user?.address || '',
        profileImage: profileForm.profileImage || user?.profileImage || ''
      });
      setSuccess('Profile updated successfully');
      setShowEditModal(false);
      // Refresh user data in UI
      window.location.reload();
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (err) {
      setError('Failed to fetch order details');
    }
  };

  const getStatusBadge = (order) => {
    if (order.status === 'delivered' || order.isDelivered) {
      return <Badge bg="success">Delivered</Badge>;
    } else if (order.status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (order.isPaid) {
      return <Badge bg="warning">Paid</Badge>;
    } else {
      return <Badge bg="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    let statusMatch =
      orderStatusFilter === 'All' ||
      (orderStatusFilter === 'Delivered' && order.isDelivered) ||
      (orderStatusFilter === 'Paid' && order.isPaid && !order.isDelivered) ||
      (orderStatusFilter === 'Pending' && !order.isPaid && !order.isDelivered);
    let dateMatch = true;
    if (dateRange.from) dateMatch = dateMatch && new Date(order.createdAt) >= new Date(dateRange.from);
    if (dateRange.to) dateMatch = dateMatch && new Date(order.createdAt) <= new Date(dateRange.to);
    return statusMatch && dateMatch;
  });

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
    <>
      <Helmet>
        <title>My Profile - ShopNellore</title>
        <meta name="description" content="Manage your ShopNellore account, view your order history, and update your personal information." />
        <link rel="canonical" href="https://shopnellore.com/profile" />
        <meta property="og:title" content="My Profile - ShopNellore" />
        <meta property="og:description" content="Manage your ShopNellore account, view your order history, and update your personal information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopnellore.com/profile" />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Profile - ShopNellore" />
        <meta name="twitter:description" content="Manage your ShopNellore account, view your order history, and update your personal information." />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div className="profile-page">
        <Container className="py-5">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex align-items-center mb-3 justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="profile-icon me-3">
                    <UserIcon style={{ width: '32px', height: '32px' }} />
                  </div>
                  <div>
                    <h1 className="h2 mb-0 fw-bold gradient-text">My Profile</h1>
                    <p className="text-muted mb-0">Manage your account and view order history</p>
                  </div>
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

          {/* Profile Overview Card */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="profile-overview-card">
                <Card.Body className="text-center">
                  <div className="profile-avatar mb-3">
                    {user?.profileImage ? (
                      <img src={user.profileImage.startsWith('http') ? user.profileImage : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profileImage}`} alt="Profile" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', border: '2px solid #eee' }} />
                    ) : (
                      <UserIcon style={{ width: '64px', height: '64px' }} />
                    )}
                  </div>
                  <h4 className="fw-bold mb-1">{user?.name}</h4>
                  <p className="text-muted mb-3">{user?.email}</p>
                  {/* Show Admin Dashboard button for admins */}
                  {user?.isAdmin && (
                    <Button
                      as="a"
                      href="/admin"
                      variant="danger"
                      className="mb-3"
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <div className="profile-stats">
                    <div className="stat-item">
                      <h5 className="fw-bold text-primary">{orders.length}</h5>
                      <small className="text-muted">Total Orders</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="profile-info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Account Information</h5>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setProfileForm({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || '',
                          profileImage: user?.profileImage || ''
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <PencilIcon style={{ width: '16px', height: '16px' }} className="me-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <div className="info-item mb-3">
                        <div className="info-icon">
                          <UserIcon style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div>
                          <small className="text-muted">Full Name</small>
                          <p className="mb-0 fw-semibold">{user?.name || '-'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item mb-3">
                        <div className="info-icon">
                          <EnvelopeIcon style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div>
                          <small className="text-muted">Email</small>
                          <p className="mb-0 fw-semibold">{user?.email}</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="info-item mb-3">
                        <div className="info-icon">
                          <PhoneIcon style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div>
                          <small className="text-muted">Phone</small>
                          <p className="mb-0 fw-semibold">{user?.phone || '-'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item mb-3">
                        <div className="info-icon">
                          <MapPinIcon style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div>
                          <small className="text-muted">Address</small>
                          <p className="mb-0 fw-semibold">{
                            typeof user?.address === 'string'
                              ? user.address
                              : user?.address && typeof user.address === 'object'
                                ? [user.address.street, user.address.city, user.address.state, user.address.postalCode, user.address.country].filter(Boolean).join(', ')
                                : 'Not provided'
                          }</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="tabs" className="border-0" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="border-0">
                    <UserIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                    Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders" className="border-0">
                    <ShoppingCartIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                    Order History
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content className="p-4">
                {/* Profile Tab */}
                <Tab.Pane active={activeTab === 'profile'}>
                  <div className="text-center py-5">
                    <UserIcon style={{ width: '64px', height: '64px' }} className="text-muted mb-3" />
                    <h4>Profile Information</h4>
                    <p className="text-muted">Your profile information is displayed above. Click "Edit Profile" to make changes.</p>
                  </div>
                </Tab.Pane>

                {/* Orders Tab */}
                <Tab.Pane active={activeTab === 'orders'}>
                  <h4 className="mb-3">Order History</h4>
                  <Row className="mb-3">
                    <Col md={4} className="mb-2 mb-md-0">
                      <Form.Select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Delivered">Delivered</option>
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
                    <Table responsive hover aria-label="Order History Table">
                      <thead>
                        <tr>
                          <th scope="col">Order ID</th>
                          <th scope="col">Date</th>
                          <th scope="col">Total</th>
                          <th scope="col">Status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <code className="small">{order._id.slice(-8)}</code>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="fw-semibold">₹{order.totalPrice}</td>
                            <td>{getStatusBadge(order)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleViewOrder(order._id)}
                              >
                                <EyeIcon style={{ width: '16px', height: '16px' }} className="me-1" />
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Container>

        {/* Edit Profile Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} aria-label="Edit Profile Modal" centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleProfileSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={profileForm.email}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={typeof profileForm.address === 'string' ? profileForm.address : (profileForm.address?.street || '')}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  placeholder="Enter your address"
                />
              </Form.Group>
              {profileForm.profileImage && (
                <div className="mt-2">
                  <img src={profileForm.profileImage.startsWith('http') ? profileForm.profileImage : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${profileForm.profileImage}`} alt="Profile Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid #eee' }} />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)} aria-label="Cancel Edit Profile" tabIndex={0}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" aria-label="Save Profile Changes" tabIndex={0}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Order Details Modal */}
        <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" aria-label="Order Details Modal" centered>
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <div>
                <Row className="mb-4">
                  <Col md={6}>
                    <h6>Order Information</h6>
                    <p className="mb-1"><strong>Order ID:</strong> {selectedOrder._id}</p>
                    <p className="mb-1"><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p className="mb-1"><strong>Status:</strong> {getStatusBadge(selectedOrder)}</p>
                    {selectedOrder.isPaid && (
                      <p className="mb-1"><strong>Paid:</strong> {formatDate(selectedOrder.paidAt)}</p>
                    )}
                    {selectedOrder.isDelivered && (
                      <p className="mb-1"><strong>Delivered:</strong> {formatDate(selectedOrder.deliveredAt)}</p>
                    )}
                    {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
                      <Alert variant="danger" className="mb-2">
                        <strong>Order Cancelled:</strong> {selectedOrder.cancelReason}
                      </Alert>
                    )}
                  </Col>
                  <Col md={6}>
                    <h6>Shipping Address</h6>
                    <p className="mb-1">{selectedOrder.shippingAddress.address}</p>
                    <p className="mb-1">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p className="mb-1">{selectedOrder.shippingAddress.country}</p>
                  </Col>
                </Row>
                {/* Invoice Table */}
                <h5 className="mb-3">Order Items</h5>
                <Table bordered responsive className="mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems.map((item, idx) => (
                      <tr key={item._id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.image && item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image}`}
                              alt={item.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, marginRight: 10 }}
                              onError={e => e.target.src = '/default-product.png'}
                            />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.qty}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.qty * item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {/* Order Summary */}
                <Row className="justify-content-end">
                  <Col md={6} lg={5}>
                    <Card className="shadow-sm">
                      <Card.Body>
                        <h6 className="mb-3 fw-bold">Order Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Items Total</span>
                          <span>₹{selectedOrder.itemsPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping</span>
                          <span>₹{selectedOrder.shippingPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tax</span>
                          <span>₹{selectedOrder.taxPrice}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-2 fw-bold fs-5">
                          <span>Total</span>
                          <span>₹{selectedOrder.totalPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                          <span>Payment Method</span>
                          <span className="fw-semibold">{selectedOrder.paymentMethod}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderModal(false)} aria-label="Close Order Details" tabIndex={0}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <style>{`
          .profile-page {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          .profile-icon {
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
          .profile-overview-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            background: white;
          }
          .profile-info-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            background: white;
          }
          .profile-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          .profile-stats {
            border-top: 1px solid #e9ecef;
            padding-top: 1rem;
          }
          .stat-item {
            display: inline-block;
            padding: 0 1rem;
          }
          .info-item {
            display: flex;
            align-items: flex-start;
          }
          .info-icon {
            background: #f8f9fa;
            color: #667eea;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
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
          .btn-outline-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .animate-fade-in {
            animation: fadeIn 0.7s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: none; }
          }
          .profile-info-card, .profile-overview-card, .modal-content {
            border-radius: 18px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            transition: box-shadow 0.3s;
          }
          .profile-info-card:hover, .profile-overview-card:hover {
            box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          }
        `}</style>
      </div>
    </>
  );
};

export default ProfilePage; 