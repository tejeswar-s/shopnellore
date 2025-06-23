import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
              <span className="text-white fw-bold fs-5">S</span>
            </div>
            ShopNellore
          </div>
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navigation Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="fw-semibold">Home</Nav.Link>
            <Nav.Link as={Link} to="/products" className="fw-semibold">Products</Nav.Link>
            <Nav.Link as={Link} to="/wishlist" className="fw-semibold">Wishlist</Nav.Link>
            <Nav.Link as={Link} to="/about" className="fw-semibold">About</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="fw-semibold">Contact</Nav.Link>
          </Nav>

          {/* Right Side Actions */}
          <Nav className="ms-auto">
            {/* Cart */}
            <Nav.Link 
              as={Link} 
              to={isAuthenticated ? "/cart" : "#"} 
              className="position-relative me-3"
              onClick={handleCartClick}
              style={{ cursor: isAuthenticated ? 'pointer' : 'pointer' }}
            >
              <ShoppingCartIcon style={{ width: '24px', height: '24px' }} />
              {isAuthenticated && itemCount > 0 && (
                <Badge 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle rounded-pill"
                  style={{ fontSize: '0.7rem', transform: 'translate(-50%, -50%)' }}
                >
                  {itemCount}
                </Badge>
              )}
            </Nav.Link>

            {/* User Menu */}
            {user ? (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center me-2">
                  <UserIcon style={{ width: '20px', height: '20px' }} className="me-1" />
                  <span className="d-none d-md-inline">{user.name}</span>
                </Nav.Link>
                <Button variant="outline-primary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="outline-primary" size="sm">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 