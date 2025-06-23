import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './HomePage.css';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products/featured');
        setFeaturedProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch featured products.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleProductClick = (e, productId) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <TruckIcon style={{ width: '32px', height: '32px' }} />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: <ShieldCheckIcon style={{ width: '32px', height: '32px' }} />,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: <CreditCardIcon style={{ width: '32px', height: '32px' }} />,
      title: 'Easy Returns',
      description: '30-day money-back guarantee'
    },
    {
      icon: <ShoppingBagIcon style={{ width: '32px', height: '32px' }} />,
      title: 'Quality Products',
      description: 'Curated selection of premium items'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} style={{ width: '16px', height: '16px', color: '#ffc107', fill: '#ffc107' }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" style={{ width: '16px', height: '16px', color: '#ffc107', fill: '#ffc107' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} style={{ width: '16px', height: '16px', color: '#dee2e6' }} />);
    }

    return stars;
  };

  return (
    <>
      <Helmet>
        <title>ShopNellore - Your One-Stop Online Store</title>
        <meta name="description" content="ShopNellore is your trusted online store for electronics, fashion, and more. Discover amazing deals, fast shipping, and top-rated products!" />
        <link rel="canonical" href="https://shopnellore.com/" />
        <meta property="og:title" content="ShopNellore - Your One-Stop Online Store" />
        <meta property="og:description" content="ShopNellore is your trusted online store for electronics, fashion, and more. Discover amazing deals, fast shipping, and top-rated products!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopnellore.com/" />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ShopNellore - Your One-Stop Online Store" />
        <meta name="twitter:description" content="ShopNellore is your trusted online store for electronics, fashion, and more. Discover amazing deals, fast shipping, and top-rated products!" />
        <meta name="twitter:image" content="/logo512.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ShopNellore",
            "url": "https://shopnellore.com/",
            "logo": "https://shopnellore.com/logo512.png",
            "sameAs": [
              "https://twitter.com/ShopNellore",
              "https://facebook.com/ShopNellore"
            ]
          }
        `}</script>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ShopNellore",
            "url": "https://shopnellore.com/"
          }
        `}</script>
      </Helmet>
      <div>
        {/* Hero Section */}
        <section className="hero-gradient">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="text-center text-lg-start">
                <h1 className="display-4 fw-bold mb-4">
                  Discover Amazing Products at <span className="text-warning">ShopNellore</span>
                </h1>
                <p className="lead mb-4">
                  Your one-stop destination for quality products. From electronics to fashion, 
                  we've got everything you need at unbeatable prices.
                </p>
                <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                  <Button as={Link} to="/products" size="lg" variant="warning" className="fw-semibold">
                    Shop Now
                  </Button>
                  <Button as={Link} to="/about" size="lg" variant="outline-light" className="fw-semibold">
                    Learn More
                  </Button>
                </div>
              </Col>
              <Col lg={6} className="text-center mt-5 mt-lg-0">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
                  alt="People shopping with bags in a mall" 
                  className="img-fluid rounded-3 shadow"
                />
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-5 bg-white">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="display-6 fw-bold mb-3">Why Choose ShopNellore?</h2>
                <p className="lead text-muted">We're committed to providing the best shopping experience</p>
              </Col>
            </Row>
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} key={index} className="mb-4">
                  <div className="text-center p-4">
                    <div className="feature-icon mx-auto mb-3">
                      {feature.icon}
                    </div>
                    <h5 className="fw-semibold mb-2">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Featured Products */}
        <section className="py-5 bg-light">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="display-6 fw-bold mb-3">Featured Products</h2>
                <p className="lead text-muted">Discover our most popular items</p>
              </Col>
            </Row>
            <Row>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                featuredProducts.map((product) => (
                <Col lg={3} md={6} key={product._id} className="mb-4">
                  <Card className="h-100 product-card shadow-hover">
                    <Link to={`/products/${product._id}`} className="stretched-link" onClick={(e) => handleProductClick(e, product._id)}></Link>
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={product.image && product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {product.originalPrice > product.price && (
                        <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                          Sale
                        </span>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-semibold mb-2">{product.name}</Card.Title>
                      <div className="d-flex align-items-center mb-2">
                        <div className="d-flex me-2">
                          {renderStars(product.rating)}
                        </div>
                        <small className="text-muted">({product.numReviews})</small>
                      </div>
                      <div className="mt-auto">
                        <span className="fs-5 fw-bold text-success">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
              )}
            </Row>
            <Row className="text-center mt-4">
              <Col>
                <Button as={Link} to="/products" size="lg" variant="outline-primary">
                  View All Products
                </Button>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Call to Action */}
        <section className="py-5 bg-primary text-white">
          <Container>
            <Row className="text-center">
              <Col>
                <h2 className="display-6 fw-bold mb-3">Ready to Start Shopping?</h2>
                <p className="lead mb-4">
                  Join thousands of satisfied customers who trust ShopNellore for their shopping needs.
                </p>
                <Button as={Link} to="/register" size="lg" variant="warning" className="fw-semibold">
                  Create Account
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default HomePage; 