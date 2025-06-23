import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const { items = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const cart = items;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="mb-4">
              <ShoppingBagIcon style={{ width: '64px', height: '64px', color: '#6c757d' }} className="mx-auto mb-3" />
              <h2 className="fw-bold mb-3">Your cart is empty</h2>
              <p className="text-muted mb-4">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button as={Link} to="/products" variant="primary" size="lg">
                Start Shopping
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const formatRupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="cart-page-bg">
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <Button 
                as={Link} 
                to="/products" 
                variant="outline-secondary" 
                size="sm"
                className="me-3"
              >
                <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
              </Button>
              <h1 className="display-6 fw-bold mb-0">Shopping Cart</h1>
            </div>
            <p className="text-muted">
              You have {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
            </p>
          </Col>
        </Row>

        <Row>
          {/* Cart Items */}
          <Col lg={8} className="mb-4">
            <Card className="cart-card shadow-lg mb-4 animate-fade-in">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold">Cart Items</h5>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {(cart || []).map((item) => (
                  <div key={item.product._id} className="cart-item-row border-bottom p-4 animate-slide-in">
                    <Row className="align-items-center">
                      {/* Product Image */}
                      <Col md={2} className="mb-3 mb-md-0">
                        <img
                          src={item.product && item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.product.image}`) : '/default-product.png'}
                          alt={item.product && item.product.name ? item.product.name : 'Product'}
                          className="img-fluid rounded cart-item-img"
                          style={{ width: '100%', height: '80px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                          onError={e => e.target.src = '/default-product.png'}
                        />
                      </Col>

                      {/* Product Details */}
                      <Col md={4} className="mb-3 mb-md-0">
                        <h6 className="fw-semibold mb-1">{item.product.name}</h6>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold text-primary">{formatRupees(item.price)}</span>
                        </div>
                        <div className="text-muted small mt-1">{item.product.brand}</div>
                      </Col>

                      {/* Quantity Controls */}
                      <Col md={3} className="mb-3 mb-md-0">
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            <MinusIcon style={{ width: '14px', height: '14px' }} />
                          </Button>
                          <span className="mx-3 fw-semibold">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            className="quantity-btn"
                            disabled={item.quantity >= item.product.countInStock}
                          >
                            <PlusIcon style={{ width: '14px', height: '14px' }} />
                          </Button>
                        </div>
                        {item.quantity >= item.product.countInStock && (
                          <small className="text-danger d-block mt-1">
                            Maximum stock reached
                          </small>
                        )}
                      </Col>

                      {/* Subtotal and Remove */}
                      <Col md={3} className="text-center text-md-end">
                        <div className="mb-2">
                          <span className="fw-bold fs-5 text-success">{formatRupees(item.price * item.quantity)}</span>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(item.product._id)}
                          className="d-flex align-items-center mx-auto mx-md-0 ms-md-auto cart-remove-btn"
                        >
                          <TrashIcon style={{ width: '14px', height: '14px' }} />
                          <span className="ms-1">Remove</span>
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="shadow-lg sticky-top animate-fade-in" style={{ top: '2rem' }}>
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 fw-semibold">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{formatRupees((cart || []).reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax</span>
                    <span>{formatRupees((cart || []).reduce((total, item) => total + (item.price * item.quantity * 0.08), 0))}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span>{formatRupees((cart || []).reduce((total, item) => total + (item.price * item.quantity * 1.08), 0))}</span>
                  </div>
                </div>

                <Alert variant="info" className="mb-3 animate-fade-in">
                  <small>
                    <strong>Free shipping</strong> on orders over ₹4000
                  </small>
                </Alert>

                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/checkout" 
                    variant="primary" 
                    size="lg"
                    className="fw-semibold cart-cta-btn"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button 
                    as={Link} 
                    to="/products" 
                    variant="outline-primary"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Additional Info */}
            <Card className="mt-3 shadow-sm animate-fade-in">
              <Card.Body>
                <h6 className="fw-semibold mb-3">Why Shop with Us?</h6>
                <ul className="list-unstyled small text-muted">
                  <li className="mb-2">
                    <span className="text-success me-2">✓</span>
                    Free shipping on orders over ₹4000
                  </li>
                  <li className="mb-2">
                    <span className="text-success me-2">✓</span>
                    30-day money-back guarantee
                  </li>
                  <li className="mb-2">
                    <span className="text-success me-2">✓</span>
                    Secure payment processing
                  </li>
                  <li>
                    <span className="text-success me-2">✓</span>
                    24/7 customer support
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .cart-page-bg {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
          min-height: 100vh;
        }
        .cart-card {
          border: none;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          overflow: hidden;
          transition: box-shadow 0.3s;
        }
        .cart-card:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        }
        .cart-item-row {
          transition: background 0.2s;
        }
        .cart-item-row:hover {
          background: #f1f5f9;
        }
        .cart-item-img {
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .cart-item-img:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .cart-remove-btn {
          transition: background 0.2s, color 0.2s;
        }
        .cart-remove-btn:hover {
          background: #f87171;
          color: #fff;
        }
        .cart-cta-btn {
          box-shadow: 0 4px 16px rgba(59,130,246,0.08);
          transition: box-shadow 0.2s, background 0.2s;
        }
        .cart-cta-btn:hover {
          background: #2563eb;
          box-shadow: 0 8px 32px rgba(59,130,246,0.16);
        }
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CartPage; 