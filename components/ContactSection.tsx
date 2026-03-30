'use client'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-4">
            Get in Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-6 leading-tight">
            Ready to start your flow?
          </h2>
          <p className="text-flow-text-muted text-base leading-relaxed mb-10">
            Tell us about your products and we&apos;ll put together a plan that fits
            your needs and budget. Fast response guaranteed.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0">
                <Phone size={18} className="text-flow-green" />
              </div>
              <a href="tel:+201550408340" className="text-flow-text-muted text-sm hover:text-flow-green transition-colors">01550408340</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-flow-green" />
              </div>
              <a href="tel:+201121443286" className="text-flow-text-muted text-sm hover:text-flow-green transition-colors">01121443286</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-flow-green" />
              </div>
              <a href="tel:+201125450608" className="text-flow-text-muted text-sm hover:text-flow-green transition-colors">01125450608</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0">
                <Mail size={18} className="text-flow-green" />
              </div>
              <a href="mailto:flowagency.eg@gmail.com" className="text-flow-text-muted text-sm hover:text-flow-green transition-colors">flowagency.eg@gmail.com</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-flow-green" />
              </div>
              <span className="text-flow-text-muted text-sm">Cairo, Egypt</span>
            </div>
          </div>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={1}
        >
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+20 ..."
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Platform
                </label>
                <select className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white">
                  <option value="">Select platform</option>
                  <option>Amazon</option>
                  <option>Noon</option>
                  <option>TikTok Shop</option>
                  <option>Shopify</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Number of Products
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50–200 products"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-flow-green mb-1.5">
                  Service Interested In
                </label>
                <select className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white">
                  <option value="">Select service</option>
                  <option>Complete Package</option>
                  <option>Photography Only</option>
                  <option>Listing Optimization</option>
                  <option>Video</option>
                  <option>Social Media</option>
                  <option>Website</option>
                  <option>Not Sure Yet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-flow-green mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your products and goals..."
                className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-flow-lime text-flow-green font-bold py-4 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm"
            >
              Send Message
            </button>

            <a
              href="https://wa.me/201550408340"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 font-bold py-4 rounded-xl hover:bg-green-700 hover:text-white transition-colors text-sm"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
