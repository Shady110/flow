import Image from 'next/image'

const serviceLinks = [
  'Photography',
  'Listing Optimization',
  'Marketplace Management',
  'Product Video',
  'Social Media Content',
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1B4D2E' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left */}
          <div>
            <Image
              src="/assets/White%20type%20-%20transparent.png"
              alt="FLOW"
              width={200}
              height={72}
              className="object-contain mb-4"
            />
            <p className="text-white font-semibold text-sm mb-3">
              Streamline Your Commerce Flow
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              A commerce operations studio helping sellers transform products
              into high-performing marketplace listings.
            </p>
          </div>

          {/* Center */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Services
            </p>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact
            </p>
            <div className="space-y-3">
              <p className="text-white/60 text-sm">contact@flowstudio.co</p>
              <p className="text-white/60 text-sm">WhatsApp — add your number</p>
              <p className="text-white/60 text-sm">Egypt 🇪🇬</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-white/40 text-sm">© 2025 FLOW. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
