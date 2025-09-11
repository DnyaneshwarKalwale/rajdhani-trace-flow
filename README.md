# Rajdhani Carpet ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed specifically for carpet manufacturing businesses. This system provides complete management of orders, inventory, production, and raw materials with unique ID traceability.

## Features

- **Order Management**: Complete order lifecycle from creation to delivery
- **Inventory Tracking**: Real-time inventory management for finished products and raw materials
- **Production Monitoring**: Multi-step production flow with machine tracking and quality control
- **Raw Materials Management**: Track and manage raw material inventory and consumption
- **Customer Management**: Comprehensive customer database with order history
- **Unique ID Traceability**: QR code generation and tracking for individual products
- **Notifications System**: Real-time alerts for low stock and production requests

## Technologies Used

This project is built with modern web technologies:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **React** - Modern UI library with hooks
- **shadcn-ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd rajdhani-trace-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
rajdhani-trace-flow/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── lib/                # Utility functions and storage
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
└── index.html             # HTML template
```

## Key Modules

- **Orders**: Order creation, acceptance, dispatch, and delivery
- **Products**: Product catalog and inventory management
- **Production**: Production batch management and workflow
- **Materials**: Raw material inventory and tracking
- **Customers**: Customer database and order history
- **Settings**: System configuration (coming soon)

## Data Storage

The application uses browser localStorage for data persistence, making it suitable for single-user or small team environments. All data is stored locally and persists between sessions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for Rajdhani Carpet manufacturing operations.

## Support

For support and questions, please contact the development team or create an issue in the repository.