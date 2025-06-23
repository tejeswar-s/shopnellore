# ShopNellore Frontend

A modern, responsive e-commerce frontend built with React and Tailwind CSS for the ShopNellore project.

## Features

- 🛍️ **Modern E-commerce UI** - Beautiful, responsive design with professional styling
- 🔐 **User Authentication** - Login, registration, and profile management
- 🛒 **Shopping Cart** - Add, remove, and manage cart items with real-time updates
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Tailwind CSS** - Modern utility-first CSS framework for rapid UI development
- 🔍 **Product Search & Filtering** - Advanced search and filter functionality
- ⚡ **Fast Performance** - Optimized for speed and user experience
- 🔔 **Toast Notifications** - User-friendly feedback for all actions
- 🎯 **Context API** - Efficient state management with React Context

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Toast notifications
- **Vite** - Fast build tool (if using Vite)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShopNellore/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation header
│   └── Footer.js       # Site footer
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state
│   └── CartContext.js  # Shopping cart state
├── pages/              # Page components
│   ├── HomePage.js     # Landing page
│   ├── LoginPage.js    # User login
│   ├── RegisterPage.js # User registration
│   ├── ProductListPage.js # Product catalog
│   ├── CartPage.js     # Shopping cart
│   └── ...            # Other pages
├── utils/              # Utility functions
│   └── api.js         # API configuration
├── App.js             # Main app component
└── index.js           # App entry point
```

## Key Components

### Authentication System
- **AuthContext**: Manages user authentication state
- **LoginPage**: User login with form validation
- **RegisterPage**: User registration with validation
- **Protected Routes**: Automatic redirect for unauthenticated users

### Shopping Cart
- **CartContext**: Manages cart state with localStorage persistence
- **CartPage**: Full cart management with quantity controls
- **Add to Cart**: One-click product addition

### Product Management
- **ProductListPage**: Product catalog with search and filters
- **Product Cards**: Responsive product display
- **Search & Filtering**: Advanced product discovery

## API Integration

The frontend communicates with the backend through the `api.js` utility:

```javascript
import api from '../utils/api';

// Example API calls
const products = await api.get('/products');
const user = await api.post('/users/login', { email, password });
```

## Styling

The project uses Tailwind CSS with custom components:

```css
/* Custom button styles */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg;
}

/* Custom card styles */
.product-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Features to Add

- [ ] Product detail page with reviews
- [ ] User profile management
- [ ] Order history and tracking
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Advanced filtering
- [ ] Image gallery
- [ ] Social sharing

## Support

For support, email support@shopnellore.com or create an issue in the repository.

## License

This project is licensed under the MIT License.
