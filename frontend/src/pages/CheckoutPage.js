import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, total, clearCart } = useCart();
  const { user } = useAuth();

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (user) {
      setShipping((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || 'India',
      }));
    }
  }, [user]);

  const [paymentMethod] = useState('COD'); // Default to COD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tax = Math.round(total * 0.08);
  const shippingPrice = total > 4000 ? 0 : 99;
  const totalPrice = total + tax + shippingPrice;

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.postalCode || !shipping.country) {
      setError('Please fill in all required shipping fields.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.price,
          qty: item.quantity,
        })),
        shippingAddress: {
          name: shipping.name,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          country: shipping.country,
        },
        paymentMethod,
        itemsPrice: total,
        taxPrice: tax,
        shippingPrice,
        totalPrice,
      };
      const { data: createdOrder } = await api.post('/orders', orderData);
      
      if (createdOrder && createdOrder._id) {
        clearCart();
        navigate(`/orders/${createdOrder._id}`);
      } else {
        setError('Failed to create the order. The response from the server was invalid. Please try again.');
        console.error('Invalid order creation response:', createdOrder);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col md={7}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h4 className="mb-0 fw-bold">Shipping Information</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePlaceOrder}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control name="name" value={shipping.name} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control name="email" type="email" value={shipping.email} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control name="phone" value={shipping.phone} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control name="address" value={shipping.address} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control name="city" value={shipping.city} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>State</Form.Label>
                      <Form.Control name="state" value={shipping.state} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control name="postalCode" value={shipping.postalCode} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control name="country" value={shipping.country} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Payment Method</Form.Label>
                      <div>
                        <Form.Check
                          type="radio"
                          label="Cash on Delivery"
                          name="paymentMethod"
                          value="COD"
                          checked={true}
                          readOnly
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <div className="d-grid mt-4">
                  <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Place Order'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h4 className="mb-0 fw-bold">Order Summary</h4>
            </Card.Header>
            <Card.Body>
              {cartItems.length === 0 ? (
                <Alert variant="info">Your cart is empty.</Alert>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <Row key={item.product._id} className="align-items-center mb-3">
                      <Col xs={3}>
                        <img
                          src={item.product.image && item.product.image.startsWith('http') ? item.product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.product.image}`}
                          alt={item.product.name}
                          className="img-fluid rounded"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          onError={e => e.target.src = '/default-product.png'}
                        />
                      </Col>
                      <Col xs={5}>
                        <div className="fw-semibold">{item.product.name}</div>
                        <div className="text-muted small">Qty: {item.quantity}</div>
                      </Col>
                      <Col xs={4} className="text-end">
                        <div className="fw-bold">₹{item.price * item.quantity}</div>
                      </Col>
                    </Row>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>{shippingPrice === 0 ? <span className="text-success">Free</span> : `₹${shippingPrice}`}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage; 