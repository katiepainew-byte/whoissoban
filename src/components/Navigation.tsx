import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { navigationConfig } from '../config';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (id: string) => {
    if (!isHome) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!navigationConfig.brandMark && navigationConfig.links.length === 0) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        padding: '24px 4vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.5s ease',
        backgroundColor: scrolled ? 'rgba(5, 10, 15, 0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
    >
      <Link
        to="/"
        className="font-serif-display"
        style={{
          fontSize: '18px',
          fontWeight: 400,
          letterSpacing: '0.15em',
          color: '#FFFFFF',
          textDecoration: 'none',
        }}
      >
        {navigationConfig.brandMark}
      </Link>
      <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
        {navigationConfig.links.map((item) => (
          isHome ? (
            <button
              key={item.targetId}
              onClick={() => handleNavClick(item.targetId)}
              className="font-sans-body"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                opacity: 0.6,
                fontSize: '14px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'opacity 0.4s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = '0.6';
              }}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.targetId}
              to={item.targetId === 'philosophy' || item.targetId === 'gallery' || item.targetId === 'mediums' ? `/#${item.targetId}` : `/#${item.targetId}`}
              className="font-sans-body"
              style={{
                color: '#FFFFFF',
                opacity: 0.6,
                fontSize: '14px',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                transition: 'opacity 0.4s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = '0.6';
              }}
            >
              {item.label}
            </Link>
          )
        ))}
        <Link
          to="/blogs"
          className="font-sans-body"
          style={{
            color: '#FFFFFF',
            opacity: location.pathname.startsWith('/blogs') ? 1 : 0.6,
            fontSize: '14px',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            transition: 'opacity 0.4s ease',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = location.pathname.startsWith('/blogs') ? '1' : '0.6'; }}
        >
          Blog
        </Link>
        <Link
          to="/research"
          className="font-sans-body"
          style={{
            color: '#FFFFFF',
            opacity: location.pathname.startsWith('/research') ? 1 : 0.6,
            fontSize: '14px',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            transition: 'opacity 0.4s ease',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = location.pathname.startsWith('/research') ? '1' : '0.6'; }}
        >
          Research
        </Link>
        {isAuthenticated && (
          <Link
            to="/admin"
            className="font-sans-body"
            style={{
              color: '#30B0D0',
              opacity: location.pathname === '/admin' ? 1 : 0.8,
              fontSize: '14px',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              transition: 'opacity 0.4s ease',
              border: '1px solid rgba(48, 176, 208, 0.3)',
              padding: '4px 14px',
              borderRadius: '999px',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = location.pathname === '/admin' ? '1' : '0.8'; }}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
