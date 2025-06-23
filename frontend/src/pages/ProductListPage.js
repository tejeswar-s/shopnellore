import React, { useState, useEffect, useCallback, memo } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReactSlider from 'react-slider';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon as HeartOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarFilled } from '@heroicons/react/24/solid';
import { HeartIcon as HeartFilled } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ProductListPage.css';
import { Helmet } from 'react-helmet-async';

const ProductListPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sliderValues, setSliderValues] = useState([0, 100000]);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination state
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, selectedCategory, selectedBrand, priceRange, minRating, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/products/brands');
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (priceRange.min > 0) params.append('minPrice', priceRange.min);
      if (priceRange.max < 100000) params.append('maxPrice', priceRange.max);
      if (minRating) params.append('minRating', minRating);
      if (sortBy) params.append('sortBy', sortBy);
      if (currentPage > 1) params.append('pageNumber', currentPage);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
      setTotalProducts(response.data.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: 100000 });
    setSliderValues([0, 100000]);
    setMinRating('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleAddToCart = useCallback((product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product, 1);
  }, [isAuthenticated, navigate, addToCart]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFilled key={i} style={{ width: '16px', height: '16px', color: '#ffc107' }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" style={{ width: '16px', height: '16px', color: '#ffc107' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} style={{ width: '16px', height: '16px', color: '#dee2e6' }} />);
    }

    return stars;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Memoized ProductCard for performance
  const ProductCard = memo(({ product, handleAddToCart, isWishlisted, toggleWishlist, toast }) => (
    <Card className="product-card h-100">
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <Card.Img
            variant="top"
            src={product.image && product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
            alt={product.name}
            style={{ height: '200px', objectFit: 'cover' }}
            loading="lazy"
            width={300}
            height={200}
            srcSet={product.image && product.image.startsWith('http') ? `${product.image}?w=300 300w, ${product.image}?w=600 600w` : ''}
            sizes="(max-width: 600px) 100vw, 300px"
            onError={e => e.target.src = '/default-product.png'}
          />
        </Link>
        <div className="product-overlay">
          <Button
            variant="outline-light"
            size="sm"
            className="me-2"
            style={{ background: 'rgba(255,255,255,0.85)', color: '#0d6efd', border: '1px solid #0d6efd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            onClick={() => {
              if (product.countInStock === 0) {
                toast.error('This product is out of stock!');
              } else {
                handleAddToCart(product);
              }
            }}
            disabled={product.countInStock === 0}
          >
            <ShoppingCartIcon style={{ width: '16px', height: '16px', color: '#0d6efd', opacity: 1 }} />
          </Button>
          <Button
            variant="outline-light"
            size="sm"
            style={{ background: 'rgba(255,255,255,0.85)', color: isWishlisted(product._id) ? '#dc3545' : '#6c757d', border: '1px solid #dc3545', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => {
              toggleWishlist(product);
              toast.success(isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
            }}
          >
            {isWishlisted(product._id)
              ? <HeartFilled style={{ width: '16px', height: '16px', color: '#dc3545', opacity: 1 }} />
              : <HeartOutline style={{ width: '16px', height: '16px', color: '#dc3545', opacity: 1 }} />}
          </Button>
        </div>
        {product.featured && (
          <Badge bg="warning" className="featured-badge">
            Featured
          </Badge>
        )}
        {product.countInStock === 0 && (
          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">Out of Stock</Badge>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <Badge bg="secondary" className="me-2">
            {product.category}
          </Badge>
          <Badge bg="info">
            {product.brand}
          </Badge>
        </div>
        <h6 className="card-title fw-bold mb-2">
          <Link to={`/product/${product._id}`} className="text-decoration-none">
            {product.name}
          </Link>
        </h6>
        <div className="d-flex align-items-center mb-2">
          <div className="d-flex me-2">
            {renderStars(product.rating)}
          </div>
          <small className="text-muted">
            ({product.numReviews})
          </small>
        </div>
        <p className="card-text text-muted small flex-grow-1">
          {product.description.substring(0, 80)}...
        </p>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-primary">
              {formatPrice(product.price)}
            </span>
            <small className="text-muted">
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  ));

  if (loading && products.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Products - ShopNellore</title>
        <meta name="description" content="Browse all products at ShopNellore. Find electronics, fashion, and more at unbeatable prices!" />
        <link rel="canonical" href="https://shopnellore.com/products" />
        <meta property="og:title" content="All Products - ShopNellore" />
        <meta property="og:description" content="Browse all products at ShopNellore. Find electronics, fashion, and more at unbeatable prices!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopnellore.com/products" />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All Products - ShopNellore" />
        <meta name="twitter:description" content="Browse all products at ShopNellore. Find electronics, fashion, and more at unbeatable prices!" />
        <meta name="twitter:image" content="/logo512.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://shopnellore.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": "https://shopnellore.com/products"
              }
            ]
          }
        `}</script>
      </Helmet>
      <div className="products-page">
        <Container className="py-5">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h1 className="h2 fw-bold mb-2">All Products</h1>
                  <p className="text-muted mb-0">
                    {totalProducts} products found
                    {searchKeyword && ` for "${searchKeyword}"`}
                  </p>
                </div>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="d-lg-none"
                >
                  <FunnelIcon style={{ width: '20px', height: '20px' }} className="me-2" />
                  Filters
                </Button>
              </div>
            </Col>
          </Row>

          {/* Search Bar */}
          <Row className="mb-4">
            <Col>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text>
                    <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products, brands, or categories..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>

          <Row>
            {/* Filters Sidebar */}
            <Col lg={3} className={`mb-4 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
              <Card className="filter-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Filters</h5>
                  <Button variant="link" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </Card.Header>
                <Card.Body>
                  {/* Sort By */}
                  <div className="mb-4">
                    <h6>Sort By</h6>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating_desc">Highest Rated</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </Form.Select>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-4">
                    <h6>Category</h6>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="">All Categories</option>
                      {Array.isArray(categories) && categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-4">
                    <h6>Brand</h6>
                    <Form.Select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="">All Brands</option>
                      {Array.isArray(brands) && brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-4">
                    <h6>Price Range</h6>
                    <div className="price-slider-container">
                      <ReactSlider
                        className="horizontal-slider"
                        thumbClassName="thumb"
                        trackClassName="track"
                        value={sliderValues}
                        min={0}
                        max={100000}
                        step={1000}
                        ariaLabel={['Lower thumb', 'Upper thumb']}
                        pearling
                        minDistance={1000}
                        onChange={(value) => setSliderValues(value)}
                      />
                      <div className="d-flex justify-content-between mt-2">
                        <span>{formatPrice(sliderValues[0])}</span>
                        <span>{formatPrice(sliderValues[1])}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="mt-2 w-100"
                      onClick={() => {
                        setPriceRange({ min: sliderValues[0], max: sliderValues[1] });
                        handleFilterChange();
                      }}
                    >
                      Apply Price
                    </Button>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-4">
                    <h6>Minimum Rating</h6>
                    <Form.Select
                      value={minRating}
                      onChange={(e) => {
                        setMinRating(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                    </Form.Select>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Products Grid */}
            <Col lg={9}>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {products.length === 0 && !loading ? (
                <div className="text-center py-5">
                  <h4>No products found</h4>
                  <p className="text-muted">Try adjusting your search or filters</p>
                  <Button variant="outline-primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <Row>
                    {products.map((product) => (
                      <Col key={product._id} md={6} lg={4} className="mb-4">
                        <ProductCard
                          product={product}
                          handleAddToCart={handleAddToCart}
                          isWishlisted={isWishlisted}
                          toggleWishlist={toggleWishlist}
                          toast={toast}
                        />
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>

        <style>{`
          .products-page {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          .filter-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 2rem;
          }
          .product-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            overflow: hidden;
          }
          .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          }
          .product-image-container {
            position: relative;
            overflow: hidden;
            height: 200px;
          }
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
          .product-card:hover .product-image {
            transform: scale(1.05);
          }
          .product-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .product-card:hover .product-overlay {
            opacity: 1;
          }
          .featured-badge {
            position: absolute;
            top: 10px;
            left: 10px;
          }
          .card-title a {
            color: #333;
          }
          .card-title a:hover {
            color: #007bff;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductListPage; 