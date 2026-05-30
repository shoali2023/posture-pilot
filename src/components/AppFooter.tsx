import { BrandLogo } from './BrandLogo'

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <BrandLogo variant="symbol" size="20px" ariaLabel="PosturePilot" />
        <span className="app-footer__brand-name">PosturePilot</span>
      </div>

      <p className="app-footer__note">
        Developed as an academic prototype for gesture-based posture awareness.
      </p>

      <p className="app-footer__disclaimer">
        PosturePilot supports posture awareness and habit-building only. It is not a medical tool.
        If you experience pain or discomfort, consult a qualified healthcare professional.
      </p>

      <div className="app-footer__author">
        <span className="app-footer__author-name">Ali Shoeibi</span>
        <span className="app-footer__author-role">
          Master's student in Intelligent Systems · AI, HCI &amp; Intelligent Web Applications
        </span>
        <span className="app-footer__author-uni">University of Salamanca</span>
        <div className="app-footer__links">
          <a
            href="https://github.com/shoali2023"
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer__link"
            aria-label="Ali Shoeibi on GitHub"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/ali-shoeibi01"
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer__link"
            aria-label="Ali Shoeibi on LinkedIn"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
