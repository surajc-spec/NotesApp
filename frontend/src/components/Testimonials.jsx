import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Quote, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_TESTIMONIALS = [
  {
    _id: '1',
    name: 'Suraj Chougule',
    branch: 'Computer Engineering',
    semester: 6,
    rating: 5,
    comment: 'NoteShare saved my In-Sem exams! The organized unit-wise notes and previous year question papers are absolute gold for SPPU engineering students.',
  },
  {
    _id: '2',
    name: 'Aarav Sharma',
    branch: 'Information Technology',
    semester: 4,
    rating: 5,
    comment: 'Downloading PDF notes directly without annoying ads or spam links is so refreshing. Best academic platform for engineering notes.',
  },
  {
    _id: '3',
    name: 'Priya Kulkarni',
    branch: 'Electronics & Telecommunication',
    semester: 5,
    rating: 5,
    comment: 'The End-Sem question papers collection is super accurate. Loved the clean dark mode interface and fast loading speeds!',
  },
  {
    _id: '4',
    name: 'Rohan Patil',
    branch: 'Computer Engineering',
    semester: 3,
    rating: 5,
    comment: 'The exam filter for In-Sem and End-Sem notes made studying during revision week so stress-free. 10/10 recommendation!',
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/feedback/testimonials');
        if (response.ok) {
          const data = await response.json();
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials);
          }
        }
      } catch (err) {
        console.log('Using fallback testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-light-background dark:bg-dark-background transition-colors duration-300 relative overflow-hidden border-b border-light-border/60 dark:border-dark-border/60">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>Student Feedback</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-light-foreground dark:text-dark-foreground tracking-tight">
            Loved by Engineering Students
          </h2>
          <p className="mt-4 text-base sm:text-lg text-light-muted dark:text-dark-muted font-normal max-w-2xl mx-auto">
            See how NoteShare is helping thousands of engineering students ace their In-Sem and End-Sem university exams.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="group relative bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-dark-border hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                {/* Quote Icon & Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (item.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-primary/20 group-hover:text-primary/40 transition-colors" />
                </div>

                {/* Comment Text */}
                <p className="text-sm text-light-foreground dark:text-dark-foreground/90 leading-relaxed font-normal italic mb-6">
                  "{item.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-light-border/60 dark:border-dark-border/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                  {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-light-foreground dark:text-dark-foreground truncate">
                      {item.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted truncate">
                    {item.branch} &bull; Sem {item.semester}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* CTA Button to Submit Feedback */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            to="/feedback"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 shadow-glow hover:scale-[1.03] active:scale-[0.97]"
          >
            <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
            <span>Share Your Experience &amp; Review NoteShare</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
