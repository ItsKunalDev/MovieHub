import { FiGithub, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';
import './Footer.css';

const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
  Discover: ['Trending', 'Top Rated', 'Upcoming', 'TV Shows'],
};

const socials = [
  { icon: <FiTwitter />, href: '#', label: 'Twitter' },
  { icon: <FiInstagram />, href: '#', label: 'Instagram' },
  { icon: <FiYoutube />, href: '#', label: 'YouTube' },
  { icon: <FiGithub />, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <MdLocalMovies className="footer-logo-icon" />
            <span>MovieHub</span>
          </div>
          <p className="footer-tagline">
            Discover, explore, and enjoy cinema without limits.
            Your gateway to endless entertainment.
          </p>
          <div className="footer-socials">
            {socials.map(({ icon, href, label }) => (
              <a key={label} href={href} className="social-icon" aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links">
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="footer-col">
              <h4 className="footer-col-title">{group}</h4>
              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MovieHub. Powered by TMDb API.</p>
        <p className="footer-disclaimer">
          This product uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
      </div>
    </footer>
  );
}
