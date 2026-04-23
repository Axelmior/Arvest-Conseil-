import './Logo.css';

export default function Logo({ light = false }) {
  return (
    <div className="logo">
      <div className="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#C6A75E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      </div>
      <div className={light ? 'logo-text logo-text-light' : 'logo-text'}>
        Arvest<span className="logo-accent"> Pilot</span>
      </div>
    </div>
  );
}
