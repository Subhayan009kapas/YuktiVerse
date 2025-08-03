# YuktiVerse - AI-Powered PDF Analysis Platform

A modern web application that analyzes PDF content, displays summaries, and generates interactive multiple-choice questions for learning and assessment.

## 🚀 Features

### PDF Processor
- **Smart PDF Upload**: Drag-and-drop interface with file validation
- **AI-Powered Summarization**: Generate comprehensive document summaries
- **MCQ Generation**: Create interactive multiple-choice questions from content
- **Test Mode**: Take quizzes with real-time scoring and feedback
- **Professional UI**: Modern, responsive design with smooth animations

### Resume Analyzer
- **Resume Analysis**: AI-powered resume evaluation and improvement suggestions
- **Skill Assessment**: Identify strengths and areas for improvement
- **Professional Insights**: Get detailed feedback on resume content and structure

### Navigation & UI
- **Top Navigation Bar**: Professional navbar with search and user actions
- **Collapsible Sidebar**: Smart sidebar with navigation links and statistics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Full-page stylish loader with custom animations

## 🛠️ Technology Stack

- **Frontend**: React.js with modern hooks and functional components
- **Styling**: CSS3 with custom properties and modern animations
- **Routing**: React Router for seamless navigation
- **HTTP Client**: Axios for API communication
- **Backend**: Node.js with Express (separate server)
- **AI Integration**: Gemini AI for content processing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start server
npm start
```

## 🎨 UI Components

### Navigation
- **Navbar**: Fixed top navigation with logo, menu items, and user actions
- **Sidebar**: Collapsible sidebar with navigation links and statistics
- **Responsive**: Mobile-friendly navigation with hamburger menu

### PDF Processing
- **Upload Area**: Drag-and-drop interface with file validation
- **Summary Modal**: Centered popup with dimmed background for document summaries
- **MCQ Display**: Smartly sized question/answer containers with professional styling
- **Test Interface**: Interactive quiz mode with progress tracking

### Loading States
- **Full-Page Loader**: Combines text animation and speeder animation
- **Custom Colors**: Theme-matched loader colors (#68d391, #81e6d9)
- **Smooth Transitions**: Professional loading experience

## 🎯 Key Features Implementation

### Summary Display
- **Centered Modal**: Summary appears in a centered popup overlay
- **Dimmed Background**: Professional overlay with backdrop blur
- **Optimized Sizing**: Smaller width (600px) and larger height (90vh) for better readability
- **No Scrolling**: Content fits in first view without requiring scroll

### MCQ Components
- **Smart Sizing**: Question/answer containers are neither too tall nor too wide
- **Professional Styling**: Visually appealing design with hover effects
- **Hidden Answers**: Answers appear on click with smooth animations
- **Correct Answer Highlighting**: Visual indicators for correct responses

### Loading States
- **Full-Page Overlay**: Replaces button spinners with comprehensive loader
- **Dual Animation**: Combines text wave and speeder animations
- **Customizable Messages**: Context-aware loading messages
- **Theme Integration**: Colors match project's green/teal theme

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

### Mobile Optimizations
- Sidebar collapses on mobile devices
- Navigation adapts to smaller screens
- Touch-friendly interface elements
- Optimized spacing and typography

## 🎨 Design System

### Color Palette
- **Primary**: #68d391 (Green)
- **Secondary**: #81e6d9 (Teal)
- **Background**: #1a202c (Dark Blue)
- **Text**: #edf2f7 (Light Gray)
- **Borders**: #2d3748 (Medium Gray)

### Typography
- **Font Family**: Inter, system fonts
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold)
- **Responsive**: Scales appropriately across devices

### Animations
- **Smooth Transitions**: 0.3s ease for all interactive elements
- **Hover Effects**: Subtle transforms and color changes
- **Loading Animations**: Custom keyframe animations
- **Page Transitions**: Smooth navigation between routes

## 🔧 Development

### Project Structure
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx      # Top navigation
│   │   ├── Sidebar.jsx     # Side navigation
│   │   └── Loader.jsx      # Loading component
│   ├── features/           # Feature-specific components
│   │   └── pdf-summarizer/ # PDF processing feature
│   ├── pages/              # Page components
│   │   └── Home.jsx        # Landing page
│   └── App.jsx             # Main application
```

### Component Architecture
- **Functional Components**: Modern React with hooks
- **Props Interface**: Clear component APIs
- **State Management**: Local state with useState
- **Event Handling**: Consistent event patterns

## 🚀 Deployment

### Build for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**YuktiVerse** - Transforming learning through AI-powered document analysis 🚀 