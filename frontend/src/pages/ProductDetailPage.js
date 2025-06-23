import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { ShoppingCartIcon, StarIcon, TruckIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarFilled } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useWishlist } from '../context/WishlistContext';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartFilled } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (product && isAuthenticated) {
      const found = product.reviews.find(r => r.user === localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : '');
      setUserReview(found || null);
    }
  }, [product, isAuthenticated]);

  useEffect(() => {
    if (product) {
      setFetchingReviews(true);
      api.get(`/reviews/${product._id}`)
        .then(res => setReviews(res.data))
        .catch(() => setReviews([]))
        .finally(() => setFetchingReviews(false));
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Product not found or error loading product details.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (product && product.countInStock === 0) {
      toast.error('This product is out of stock!');
      return;
    }
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.countInStock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFilled key={i} style={{ width: '20px', height: '20px', color: '#ffc107' }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarFilled key="half" style={{ width: '20px', height: '20px', color: '#ffc107' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarFilled key={`empty-${i}`} style={{ width: '20px', height: '20px', color: '#dee2e6' }} />);
    }

    return stars;
  };

  const generateProductImages = (product) => {
    const baseImage = product.image && product.image.startsWith('http')
      ? product.image
      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`;
    return [
      baseImage,
      baseImage.replace('600x600', '600x601'),
      baseImage.replace('600x600', '600x602'),
      baseImage.replace('600x600', '600x603')
    ];
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    try {
      const { data } = await api.post(`/reviews/${product._id}`, review);
      setReviews(prev => [data, ...prev]);
      setUserReview(data);
      setReview({ rating: 0, comment: '' });
      fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5">
        <Container>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="text-muted">Loading product details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-5">
        <Container>
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error || 'Product not found'}</p>
            <Button variant="outline-danger" onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const productImages = generateProductImages(product);
  const isOutOfStock = product.countInStock === 0;

  // Add JSON-LD structured data for SEO
  const jsonLd = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 0,
      "reviewCount": product.numReviews || 0
    }
  } : null;

  return (
    <>
      <Helmet>
        <title>{`${product.name} - ShopNellore`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <meta property="og:title" content={`${product.name} - ShopNellore`} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={productImages[0]} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
      <div className="py-5 bg-light">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate('/')}>
                  Home
                </Button>
              </li>
              <li className="breadcrumb-item">
                <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate('/products')}>
                  Products
                </Button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

          <Row className="g-5">
            {/* Product Images */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  {/* Main Image */}
                  <div className="text-center mb-4">
                    <img
                      src={productImages[selectedImage]}
                      alt={product.name}
                      className="img-fluid rounded-3"
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                      loading="lazy"
                      width={500}
                      height={500}
                      srcSet={`${productImages[selectedImage]}?w=300 300w, ${productImages[selectedImage]}?w=600 600w`}
                      sizes="(max-width: 600px) 100vw, 500px"
                      onError={e => e.target.src = '/default-product.png'}
                    />
                  </div>

                  {/* Thumbnail Images */}
                  <div className="d-flex gap-2 justify-content-center">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className={`border rounded-3 p-2 cursor-pointer ${selectedImage === index ? 'border-primary' : 'border-light'}`}
                        onClick={() => setSelectedImage(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="img-fluid"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          loading="lazy"
                          width={60}
                          height={60}
                          srcSet={`${image}?w=60 60w, ${image}?w=120 120w`}
                          sizes="60px"
                          onError={e => e.target.src = '/default-product.png'}
                        />
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Product Details */}
            <Col lg={6}>
              <div className="bg-white rounded-3 p-4 shadow-sm">
                {/* Product Header */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h1 className="h2 fw-bold mb-2">{product.name}</h1>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="border-0"
                      style={{ background: 'rgba(255,255,255,0.85)', color: isWishlisted(product._id) ? '#dc3545' : '#6c757d', border: '1px solid #dc3545', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                      aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      onClick={() => {
                        toggleWishlist(product);
                        toast.success(isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
                      }}
                    >
                      {isWishlisted(product._id)
                        ? <HeartFilled style={{ width: '24px', height: '24px', color: '#dc3545', opacity: 1 }} />
                        : <HeartOutline style={{ width: '24px', height: '24px', color: '#dc3545', opacity: 1 }} />}
                    </Button>
                  </div>

                  {/* Rating */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="d-flex">
                      {renderStars(product.rating || 4.5)}
                    </div>
                    <span className="text-muted">({product.numReviews || 128} reviews)</span>
                    <Badge bg={isOutOfStock ? "danger" : "success"} className="ms-2">{isOutOfStock ? "Out of Stock" : "In Stock"}</Badge>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="h3 fw-bold text-primary me-3">Rs.{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-muted text-decoration-line-through">${product.originalPrice}</span>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Badge bg="danger" className="ms-2">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Description</h5>
                  <p className="text-muted mb-0">{product.description}</p>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-circle ${isOutOfStock ? 'bg-danger' : 'bg-success'}`}></div>
                    <span className={isOutOfStock ? 'text-danger' : 'text-success'}>
                      {isOutOfStock ? 'Out of Stock' : `${product.countInStock} items available`}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Quantity</label>
                    <div className="d-flex align-items-center gap-3">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-3 fw-bold">{quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.countInStock}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-muted small">
                        {product.countInStock} available
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mb-4">
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      className="fw-semibold"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCartIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    <Button variant="outline-primary" size="lg" className="fw-semibold">
                      Buy Now
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <TruckIcon style={{ width: '20px', height: '20px', color: 'var(--primary-color)' }} />
                        <span className="small">Free Shipping</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <ShieldCheckIcon style={{ width: '20px', height: '20px', color: 'var(--success-color)' }} />
                        <span className="small">Secure Payment</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <ArrowLeftIcon style={{ width: '20px', height: '20px', color: 'var(--warning-color)' }} />
                        <span className="small">Easy Returns</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <StarIcon style={{ width: '20px', height: '20px', color: 'var(--info-color)' }} />
                        <span className="small">Quality Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="border-top pt-4">
                  <h6 className="fw-bold mb-3">Product Details</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <span className="text-muted small">Category:</span>
                      <div className="fw-semibold">{product.category}</div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted small">Brand:</span>
                      <div className="fw-semibold">{product.brand || 'ShopNellore'}</div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted small">SKU:</span>
                      <div className="fw-semibold">{product._id}</div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted small">Weight:</span>
                      <div className="fw-semibold">{product.weight || '500g'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Reviews Section */}
          <section className="mt-5">
            <h4 className="mb-3">Customer Reviews</h4>
            {fetchingReviews ? (
              <div className="text-muted">Loading reviews...</div>
            ) : (
              <>
                <div className="mb-3">
                  <span className="fw-bold fs-5">{product.rating?.toFixed(1) || '0.0'}</span>
                  <span className="ms-2 text-warning">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
                  <span className="ms-2 text-muted">({product.numReviews || 0} reviews)</span>
                </div>
                {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
                <ul className="list-group mb-4">
                  {reviews.map((r) => (
                    <li key={r._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">{r.user?.name || 'User'}</span>
                        <span className="text-warning">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <div className="text-muted small mb-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                      <div>{r.comment}</div>
                    </li>
                  ))}
                </ul>
                {isAuthenticated && !userReview ? (
                  <Form onSubmit={handleReviewSubmit} className="border rounded p-3 bg-light">
                    <h5 className="mb-3">Leave a Review</h5>
                    {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                    <Form.Group className="mb-2">
                      <Form.Label>Rating</Form.Label>
                      <Form.Select value={review.rating} onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))} required>
                        <option value={0}>Select...</option>
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2 - Fair</option>
                        <option value={3}>3 - Good</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={5}>5 - Excellent</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Comment</Form.Label>
                      <Form.Control as="textarea" rows={2} value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Form>
                ) : isAuthenticated && userReview ? (
                  <div className="alert alert-info">You have already submitted a review for this product.</div>
                ) : (
                  <Alert variant="info">
                    Please <Link to="/login">log in</Link> to write a review.
                  </Alert>
                )}
              </>
            )}
          </section>
        </Container>
      </div>
    </>
  );
};

export default ProductDetailPage; 