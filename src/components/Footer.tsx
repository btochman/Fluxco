import { Zap, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: "Distribution", href: "#products" },
      { name: "Power", href: "#products" },
      { name: "Custom", href: "#contact" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Technology", href: "#technology" },
      { name: "Contact", href: "#contact" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl text-foreground">
                FLUXCO
              </span>
            </a>
            <p className="text-muted-foreground text-sm">
              fluxco.com
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            © {currentYear} Fluxco
          </div>
          <a
            href="tel:+15125376282"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            (512) 537-6282
          </a>
          <a
            href="/admin"
            className="text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            FluxCo Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
