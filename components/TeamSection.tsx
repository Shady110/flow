'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { team } from '@/lib/content'
import { tileReveal, staggerContainer } from '@/lib/animations'
import RevealHeading from './ui/RevealHeading'

export default function TeamSection() {
  return (
    <section id="team" className="section-padding bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid md:grid-cols-12 gap-8 items-end mb-16">
          <div className="md:col-span-7">
            <span className="eyebrow-index mb-6" data-index="07">The Team</span>
            <RevealHeading
              text="A studio of specialists behind every listing."
              accent={['specialists']}
              className="section-title mt-6"
            />
          </div>
          <p className="md:col-span-5 text-flow-text-muted text-base leading-relaxed md:text-right md:ml-auto md:max-w-sm">
            Photographers, copywriters, and marketplace managers working as one
            pipeline — so your products get expert attention at every stage.
          </p>
        </div>

        {/* Avatar grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              variants={tileReveal}
              custom={i}
              className="group surface-elevated p-5 flex flex-col items-center text-center"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-flow-border group-hover:ring-flow-lime transition-all duration-300">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-flow-green"
                    style={{ backgroundImage: 'var(--gradient-brand-soft)' }}
                  >
                    {member.initials}
                  </div>
                )}
              </div>
              <p className="font-display font-bold text-flow-green text-sm leading-tight">
                {member.name}
              </p>
              <p className="text-xs text-flow-text-muted mt-1 leading-snug">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

TeamSection.displayName = 'TeamSection'
