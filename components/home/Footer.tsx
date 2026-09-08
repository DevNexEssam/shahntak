import Link from 'next/link';
import { FaTruck, FaTwitter, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';

const socialIcons = [
  { icon: FaTwitter, label: 'Twitter' },
  { icon: FaLinkedin, label: 'LinkedIn' },
  { icon: FaInstagram, label: 'Instagram' },
  { icon: FaFacebook, label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-narrow px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            © 2026 شَحنتك. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary-foreground/50">
              تطوير بواسطة
            </span>
            <Link
              href={"https://essammohamed.vercel.app/"}
              className="text-xs text-primary-foreground/50 font-secondary hover:text-accent">
              عصام محمد
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}