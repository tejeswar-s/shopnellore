import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => (
  <>
    <Helmet>
      <title>404 Not Found - ShopNellore</title>
      <meta name="description" content="Sorry, the page you are looking for does not exist on ShopNellore." />
      <link rel="canonical" href="https://shopnellore.com/404" />
      <meta property="og:title" content="404 Not Found - ShopNellore" />
      <meta property="og:description" content="Sorry, the page you are looking for does not exist on ShopNellore." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://shopnellore.com/404" />
      <meta property="og:image" content="/logo512.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="404 Not Found - ShopNellore" />
      <meta name="twitter:description" content="Sorry, the page you are looking for does not exist on ShopNellore." />
      <meta name="twitter:image" content="/logo512.png" />
    </Helmet>
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#dc3545' }}>404</h1>
      <h2 className="mb-3">Page Not Found</h2>
      <p className="mb-4">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go to Home</Link>
    </div>
  </>
);

export default NotFoundPage; 