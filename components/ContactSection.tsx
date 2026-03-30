'use client'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react'
import { fadeUp } from '@/lib/animations'

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
                <label htmlFor="name" className="block text-sm font-medium text-flow-green mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  aria-required="true"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-flow-green mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-required="true"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-flow-green mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+20 ..."
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime"
                />
              </div>
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-flow-green mb-1.5">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white focus-visible:ring-2 focus-visible:ring-flow-lime"
                >
                  <option value="">Select platform</option>
                  <option value="amazon">Amazon</option>
                  <option value="noon">Noon</option>
                  <option value="tiktok-shop">TikTok Shop</option>
                  <option value="shopify">Shopify</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="products" className="block text-sm font-medium text-flow-green mb-1.5">
                  Number of Products
                </label>
                <input
                  id="products"
                  name="products"
                  type="text"
                  placeholder="e.g. 50–200 products"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-flow-green mb-1.5">
                  Service Interested In
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white focus-visible:ring-2 focus-visible:ring-flow-lime"
                >
                  <option value="">Select service</option>
                  <option value="complete-package">Complete Package</option>
                  <option value="photography">Photography Only</option>
                  <option value="listing">Listing Optimization</option>
                  <option value="video">Video</option>
                  <option value="social-media">Social Media</option>
                  <option value="website">Website</option>
                  <option value="not-sure">Not Sure Yet</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-flow-green mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us about your products and goals..."
                className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow resize-none focus-visible:ring-2 focus-visible:ring-flow-lime"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-flow-lime text-flow-green font-bold py-4 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2"
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

ContactSection.displayName = 'ContactSection'
