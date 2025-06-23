import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="text-center text-muted">No items in your wishlist.</div>
      ) : (
        <Row>
          {wishlist.map((product) => (
            <Col md={4} lg={3} key={product._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Link to={`/product/${product._id}`}>
                  <Card.Img 
                    variant="top" 
                    src={product.image && product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={e => e.target.src = '/default-product.png'}
                    alt={product.name}
                  />
                  {product.countInStock === 0 && (
                    <span style={{position: 'absolute', top: 10, right: 10, zIndex: 2}}>
                      <span className="badge bg-danger">Out of Stock</span>
                    </span>
                  )}
                </Link>
                <Card.Body className="d-flex flex-column">
                  <h5 className="fw-semibold mb-2">{product.name}</h5>
                  <div className="mb-2 text-primary fw-bold">₹{product.price}</div>
                  <div className="mt-auto d-flex gap-2">
                    <Button variant="primary" onClick={() => {
                      if (product.countInStock === 0) {
                        window.toast && window.toast.error ? window.toast.error('This product is out of stock!') : alert('This product is out of stock!');
                      } else {
                        addToCart(product, 1);
                      }
                    }} disabled={product.countInStock === 0}>
                      <ShoppingCartIcon style={{ width: '18px', height: '18px' }} /> Add to Cart
                    </Button>
                    <Button variant="outline-danger" onClick={() => removeFromWishlist(product._id)}>
                      <TrashIcon style={{ width: '18px', height: '18px' }} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WishlistPage; 