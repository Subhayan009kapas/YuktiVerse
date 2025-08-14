import React from 'react';
import './Loader.css'
/**
 * Base Loader Component
 * @param {Object} props
 * @param {'small'|'medium'|'large'} props.size - Size variant
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.textAnimated - Whether text should animate
 * @param {string} props.className - Additional CSS classes
 * @param {'dark'|'light'} props.theme - Color theme
 */
const LoaderBase = ({ 
  size = 'medium', 
  text, 
  textAnimated = false, 
  className = '', 
  theme = 'dark',
  children 
}) => {
  const containerClasses = [
    'loader-container',
    size !== 'medium' && `loader-${size}`,
    theme !== 'dark' && `loader-theme-${theme}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
      {text && (
        <div className={`loader-text ${textAnimated ? 'animated' : ''}`}>
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * Pulsing Dots Loader
 */
export const DotsLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-dots">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </LoaderBase>
);

/**
 * Spinning Ring Loader
 */
export const RingLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-ring"></div>
  </LoaderBase>
);

/**
 * Morphing Squares Loader
 */
export const SquaresLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-squares">
      <div className="square"></div>
      <div className="square"></div>
      <div className="square"></div>
      <div className="square"></div>
    </div>
  </LoaderBase>
);

/**
 * Wave Bars Loader
 */
export const BarsLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-bars">
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
    </div>
  </LoaderBase>
);

/**
 * Orbiting Particles Loader
 */
export const OrbitLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-orbit">
      <div className="center"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
    </div>
  </LoaderBase>
);

/**
 * Gradient Progress Loader
 */
export const ProgressLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-progress"></div>
  </LoaderBase>
);

/**
 * Hexagon Pulse Loader
 */
export const HexagonLoader = (props) => (
  <LoaderBase {...props}>
    <div className="loader-hexagon">
      <div className="hex"></div>
    </div>
  </LoaderBase>
);

/**
 * Overlay Loader (Full Screen)
 * @param {boolean} props.show - Whether to show the overlay
 * @param {'dots'|'ring'|'squares'|'bars'|'orbit'|'progress'|'hexagon'} props.type - Loader type
 * @param {Function} props.onClose - Optional close handler
 */
export const OverlayLoader = ({ 
  show = false, 
  type = 'ring', 
  text = 'Loading...', 
  size = 'large',
  theme = 'dark',
  onClose,
  ...props 
}) => {
  if (!show) return null;

  const loaderComponents = {
    dots: DotsLoader,
    ring: RingLoader,
    squares: SquaresLoader,
    bars: BarsLoader,
    orbit: OrbitLoader,
    progress: ProgressLoader,
    hexagon: HexagonLoader
  };

  const LoaderComponent = loaderComponents[type] || RingLoader;

  return (
    <div className="loader-overlay" onClick={onClose}>
      <LoaderComponent 
        size={size} 
        text={text} 
        textAnimated 
        theme={theme}
        {...props} 
      />
    </div>
  );
};

/**
 * Inline Loader (For buttons, cards, etc.)
 * @param {'dots'|'ring'|'squares'|'bars'|'orbit'|'hexagon'} props.type - Loader type
 */
export const InlineLoader = ({ 
  type = 'dots', 
  text,
  className = '',
  theme = 'dark',
  ...props 
}) => {
  const loaderComponents = {
    dots: () => (
      <div className="loader-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    ),
    ring: () => <div className="loader-ring"></div>,
    squares: () => (
      <div className="loader-squares">
        <div className="square"></div>
        <div className="square"></div>
        <div className="square"></div>
        <div className="square"></div>
      </div>
    ),
    bars: () => (
      <div className="loader-bars">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    ),
    orbit: () => (
      <div className="loader-orbit">
        <div className="center"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    ),
    hexagon: () => (
      <div className="loader-hexagon">
        <div className="hex"></div>
      </div>
    )
  };

  const LoaderComponent = loaderComponents[type] || loaderComponents.dots;
  
  const containerClasses = [
    'loader-inline',
    theme !== 'dark' && `loader-theme-${theme}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <LoaderComponent />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

/**
 * Smart Loader - Automatically chooses appropriate loader based on context
 * @param {'button'|'page'|'card'|'overlay'} props.context - Usage context
 * @param {boolean} props.show - Whether to show loader
 */
export const SmartLoader = ({ 
  context = 'page', 
  show = true,
  text,
  size,
  theme = 'dark',
  ...props 
}) => {
  if (!show) return null;

  const contextConfig = {
    button: {
      component: InlineLoader,
      props: { type: 'dots', size: 'small' }
    },
    page: {
      component: RingLoader,
      props: { size: 'large', textAnimated: true }
    },
    card: {
      component: DotsLoader,
      props: { size: 'medium' }
    },
    overlay: {
      component: OverlayLoader,
      props: { type: 'ring', size: 'large', show: true }
    }
  };

  const config = contextConfig[context] || contextConfig.page;
  const LoaderComponent = config.component;

  return (
    <LoaderComponent 
      {...config.props}
      text={text}
      size={size || config.props.size}
      theme={theme}
      {...props}
    />
  );
};

/**
 * Hook for managing loader state
 */
export const useLoader = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState('');

  const showLoader = (text = '') => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setLoadingText('');
  };

  const withLoader = async (asyncFunction, text = 'Loading...') => {
    showLoader(text);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      hideLoader();
    }
  };

  return {
    isLoading,
    loadingText,
    showLoader,
    hideLoader,
    withLoader
  };
};

/**
 * Higher-Order Component for adding loading state
 */
export const withLoading = (WrappedComponent, loaderProps = {}) => {
  return function WithLoadingComponent({ isLoading, loadingText, ...props }) {
    if (isLoading) {
      return (
        <SmartLoader 
          context="page"
          text={loadingText}
          {...loaderProps}
        />
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Example usage component showing all loaders
export const LoaderShowcase = () => {
  const { isLoading, showLoader, hideLoader, withLoader } = useLoader();

  const handleAsyncAction = async () => {
    await withLoader(
      () => new Promise(resolve => setTimeout(resolve, 3000)),
      'Processing data...'
    );
    alert('Done!');
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: '#1e293b', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      <h1 style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>
        Neumorphic Loaders Showcase
      </h1>

      {/* All loader types */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '30px' 
      }}>
        <DotsLoader text="Dots Loader" textAnimated />
        <RingLoader text="Ring Loader" />
        <SquaresLoader text="Squares Loader" />
        <BarsLoader text="Bars Loader" />
        <OrbitLoader text="Orbit Loader" />
        <ProgressLoader text="Progress Loader" />
        <HexagonLoader text="Hexagon Loader" />
      </div>

      {/* Size variants */}
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
        <RingLoader size="small" text="Small" />
        <RingLoader size="medium" text="Medium" />
        <RingLoader size="large" text="Large" />
      </div>

      {/* Inline loaders */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <button style={{ 
          padding: '12px 24px', 
          background: '#334155', 
          color: '#94a3b8', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <InlineLoader type="dots" />
          Loading Button
        </button>
        
        <button 
          onClick={handleAsyncAction}
          style={{ 
            padding: '12px 24px', 
            background: '#6366f1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Test Async Action
        </button>
      </div>

      {/* Smart Loader Examples */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <SmartLoader context="card" text="Card Loading" />
        <SmartLoader context="page" text="Page Loading" />
      </div>

      {/* Overlay Loader */}
      <OverlayLoader 
        show={isLoading} 
        type="ring" 
        text="Processing..."
        onClose={hideLoader}
      />
    </div>
  );
};

export default {
  DotsLoader,
  RingLoader,
  SquaresLoader,
  BarsLoader,
  OrbitLoader,
  ProgressLoader,
  HexagonLoader,
  OverlayLoader,
  InlineLoader, 
  SmartLoader,
  useLoader,
  withLoading,
  LoaderShowcase
};