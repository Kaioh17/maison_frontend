# Maison Frontend - Responsive UI Template

A comprehensive, mobile-first responsive web application built with React, TypeScript, and Vite. This project features a complete responsive design system that automatically adapts to different screen sizes using scalable design rules and proportional scaling.

## 🤖 AI-Assisted Development

This project was built with the assistance of AI to create a modern, responsive UI template that follows best practices for mobile-first design, accessibility, and performance optimization.

## 🚀 Features

### 📱 Responsive Design System
- **Mobile-First Approach**: Designed for mobile devices first, then enhanced for larger screens
- **Progressive Enhancement**: Smooth scaling across all breakpoints
- **Proportional Scaling**: Elements scale proportionally to screen size
- **Touch-Friendly**: Optimized for touch interactions on all devices

### 🎯 Breakpoint System
- **Mobile**: 0px to 767px
- **Tablet**: 768px to 1023px
- **Desktop**: 1024px+

### 🎨 Typography System
- **Base Font Sizes**: 14px (mobile) → 16px (tablet) → 18px (desktop)
- **Headings**: 18px (mobile) → 22px (tablet) → 26px (desktop)
- **Scalable Typography**: Uses CSS custom properties for consistent scaling

### 🔘 Button System
- **Proportional Sizing**: Padding and heights scale with screen size
- **Multiple Variants**: Primary, Secondary, Outline, Ghost
- **Size Options**: Small, Medium, Large, Extra Large
- **Touch Optimization**: Minimum 44px touch targets

### 📏 Spacing System
- **Small**: 4px → 6px → 8px
- **Medium**: 8px → 12px → 16px
- **Large**: 16px → 24px → 32px
- **Proportional Scaling**: All spacing scales with breakpoints

### 🧩 Component Library
- **Layout Components**: Header, Navigation, Main, Section, Footer
- **UI Components**: Cards, Buttons, Forms, Grids
- **Specialized Components**: Hero, Feature Grid, Stats, Testimonials, CTA
- **Responsive Utilities**: Mobile-first CSS classes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with Custom Properties
- **Layout**: CSS Grid & Flexbox
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📦 Project Structure

```
maison_frontend/
├── app/                          # React web application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── styles/              # CSS styles and responsive system
│   │   ├── App.tsx              # Main application component
│   │   └── main.tsx             # Application entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies and scripts
│   └── vite.config.ts           # Vite configuration
├── mobile_app_v1/               # Flutter mobile application
│   ├── lib/
│   │   ├── components/          # Flutter UI components
│   │   ├── screens/             # App screens
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   └── pubspec.yaml             # Flutter dependencies
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Flutter SDK (for mobile app)
- Git

### Web Application Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maison_frontend
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **For network access (mobile testing)**
   ```bash
   npm run dev:network
   ```

### Local Subdomain Testing

To test tenant-specific subdomains locally:

1. Edit `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add entries like: `127.0.0.1 tenant-slug.localhost`
3. Flush DNS: `ipconfig /flushdns`
4. Access: `http://tenant-slug.localhost:3000`

#### Common Test Slugs
- tenant1.localhost
- tenant2.localhost
- ridez.localhost
- demo.localhost

### Mobile Application Setup

1. **Navigate to mobile app directory**
   ```bash
   cd mobile_app_v1
   ```

2. **Install Flutter dependencies**
   ```bash
   flutter pub get
   ```

3. **Run on device/emulator**
   ```bash
   flutter run
   ```

## 📱 Responsive Features

### Mobile (0-767px)
- Single column layouts
- Stacked navigation
- Touch-friendly buttons (44px+)
- Optimized typography (14px base)
- Compact spacing

### Tablet (768-1023px)
- 2-column grid layouts
- Horizontal navigation
- Medium typography (16px base)
- Balanced spacing

### Desktop (1024px+)
- Multi-column layouts (3-4 columns)
- Full navigation menu
- Large typography (18px base)
- Generous spacing

## 🎨 Design System

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #6b7280 (Gray)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Yellow)
- **Error**: #ef4444 (Red)

### Typography Scale
- **H1**: 28px → 42px → 56px
- **H2**: 20px → 24px → 28px
- **H3**: 16px → 18px → 20px
- **Body**: 14px → 16px → 18px

### Spacing Scale
- **1**: 4px → 6px → 8px
- **2**: 8px → 12px → 16px
- **4**: 16px → 24px → 32px
- **8**: 32px → 48px → 64px

## 🔧 Available Scripts

### Web Application
- `npm run dev` - Start development server
- `npm run dev:network` - Start with network access
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Mobile Application
- `flutter run` - Run on connected device
- `flutter build apk` - Build Android APK
- `flutter build ios` - Build iOS app

## 📚 Documentation

- [Responsive UI Template Guide](./app/RESPONSIVE_UI_TEMPLATE.md) - Complete component documentation
- [Mobile Responsiveness Guide](./app/MOBILE_RESPONSIVENESS_GUIDE.md) - Mobile-specific features
- [Network Deployment Guide](./app/NETWORK_DEPLOYMENT.md) - Network setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with AI assistance for optimal responsive design patterns
- Inspired by modern design systems and mobile-first principles
- Uses industry-standard tools and best practices



---

**Built with ❤️ and AI assistance for the best responsive user experience**
