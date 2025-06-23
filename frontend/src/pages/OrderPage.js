import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import api from '../utils/api';

const OrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }
  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Order not found.'}</Alert>
        <Button as={Link} to="/products" variant="primary">Back to Shop</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-1">Thank you for your order!</h2>
          <p className="text-muted">Order ID: <span className="fw-semibold">{order._id || '-'}</span></p>
        </Col>
      </Row>
      <Row>
        <Col md={7}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <div><strong>Name:</strong> {order.shippingAddress?.name || '-'}</div>
              <div><strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</div>
              <div><strong>Phone:</strong> {order.shippingAddress?.phone || '-'}</div>
            </Card.Body>
          </Card>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Payment</h5>
            </Card.Header>
            <Card.Body>
              <div><strong>Method:</strong> {order.paymentMethod}</div>
              <div><strong>Status:</strong> {order.isPaid ? <span className="text-success">Paid</span> : <span className="text-danger">Not Paid</span>}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Order Items</h5>
            </Card.Header>
            <Card.Body>
              {(order.orderItems || []).map((item) => (
                <Row key={item.product} className="align-items-center mb-3">
                  <Col xs={3}>
                    <img
                      src={item.image && item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image}`}
                      alt={item.name}
                      className="img-fluid rounded"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      onError={e => e.target.src = '/default-product.png'}
                    />
                  </Col>
                  <Col xs={5}>
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted small">Qty: {item.qty}</div>
                  </Col>
                  <Col xs={4} className="text-end">
                    <div className="fw-bold">₹{typeof item.price === 'number' && typeof item.qty === 'number' ? item.price * item.qty : '-'}</div>
                  </Col>
                </Row>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{typeof order.itemsPrice === 'number' ? order.itemsPrice : '-'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>₹{typeof order.taxPrice === 'number' ? order.taxPrice : '-'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>{typeof order.shippingPrice === 'number' ? (order.shippingPrice === 0 ? <span className="text-success">Free</span> : `₹${order.shippingPrice}`) : '-'}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>₹{typeof order.totalPrice === 'number' ? order.totalPrice : '-'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col className="text-center">
          <Button as={Link} to="/products" variant="primary" size="lg">Continue Shopping</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderPage; 