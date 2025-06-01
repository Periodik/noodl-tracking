# NOODL Tracking

A comprehensive inventory and shelf-life tracking web application for ramen shops managing frozen and cold toppings.

## Features

- **Inventory Management**: Track 17 different ramen toppings with proper portion sizing
- **Expiry Alerts**: Color-coded alerts for items expiring soon or already expired
- **Thawing System**: Move frozen items to thawed state with automatic expiry calculation
- **Waste Logging**: Track discarded items with reasons and notes
- **Print Support**: Optimized printing for reports and calendars
- **Mobile Responsive**: Works on all devices

## Quick Start

### Deploy to Vercel (Recommended)

1. **Fork or Download** this repository
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js app
   - Click "Deploy"

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd noodl-tracking
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser** to `http://localhost:3000`

## Project Structure

```
noodl-tracking/
├── app/
│   ├── layout.tsx          # App layout and metadata
│   └── page.tsx            # Main application component
├── styles/
│   └── globals.css         # Global styles and print CSS
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## Toppings Included

### Cold Items (11 products)
- Mozzarella Cheese (7 days)
- American Cheddar (25 days)
- Eggs (28 days)
- Enoki Mushroom (10 days)
- Baby Bok Choy (6 days)
- Kimchi (180 days)
- Rice Cake (2 days)
- Rice (Cooked) (4 days)
- Tofu Mi-Ferme (6 days)
- Beansprout (3 days)
- Ham (4 days)

### Frozen Items (6 products)
- Cooked Chicken (4 days after thawing)
- Shabu Meat (2 days after thawing)
- Imitation Crab (4 days after thawing)
- Bacon Bits (6 days after thawing)
- Shrimp (2 days after thawing)
- Corn (4 days after thawing)

## Usage Guide

### Daily Workflow
1. **Check Dashboard** for active alerts
2. **Log new purchases** when receiving deliveries
3. **Thaw frozen items** as needed for service
4. **Handle alerts** by discarding expired items or clearing false alarms
5. **Print reports** for record keeping

### Key Features
- **Color-coded alerts**: Red (expired), Yellow (expiring soon), Green (safe)
- **Smart calculations**: Automatic portion and expiry calculations
- **Print optimization**: Clean reports with hidden UI elements
- **Real-time updates**: Quantities update as items are used or discarded

## Customization

### Adding New Products
1. Navigate to "Products" tab
2. Click "Add Product"
3. Fill in product details including shelf life
4. Save to add to inventory system

### Modifying Existing Products
1. Go to "Products" tab
2. Click edit icon next to product
3. Update details as needed
4. Save changes

## Technical Details

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState hooks
- **Data Storage**: In-memory (resets on page refresh)
- **Deployment**: Optimized for Vercel

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Print Support

The application includes optimized print styles for:
- Dashboard reports
- Inventory lists
- Waste logs
- Alert summaries

Use Ctrl+P (or Cmd+P on Mac) to print any page.

## License

This project is proprietary software for NOODL Tracking.

## Support

For support or feature requests, please contact the development team.