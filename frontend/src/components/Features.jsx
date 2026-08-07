import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Eye, ShieldCheck } from 'lucide-react';

const FEATURES_DATA = [
  {
   
    title: 'Curated Materials',
    description: 'Access verified study materials structured for maximum retention.',
  },
  {
    title: 'Student Network',
    description: 'Collaborate with top students from various branches and years.',
  },
  {
  
    title: 'Preview Only',
    description: 'Read notes inside the platform through a protected preview experience.',
  },
  {
  
    title: 'Secure & Private',
    description: 'Your data is encrypted and you control who sees your content.',
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-24 bg-light-background dark:bg-dark-background border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground mb-3 font-sans">
            Engineered for Success
          </h2>
          <p className="text-base text-light-muted dark:text-dark-muted font-sans">
            Powerful tools to help you manage your academic journey.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FEATURES_DATA.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-7 flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 group shadow-sm"
              >
                {/* Card Title */}
                <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground mt-6 mb-2.5 font-sans">
                  {feature.title}
                </h3>

                {/* Card Description */}
                <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
