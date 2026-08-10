import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquarePlus, Quote, GraduationCap, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/feedback/testimonials');
        if (response.ok) {
          const data = await response.json();
          if (data.testimonials && Array.isArray(data.testimonials)) {
            setTestimonials(data.testimonials);
          }
        }
      } catch (err) {
        console.log('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Update scroll button state
  const checkScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [testimonials]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 380; // Approximate card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-light-background dark:bg-dark-background transition-colors duration-300 relative overflow-hidden border-b border-light-border/60 dark:border-dark-border/60">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="text-left max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-light-foreground dark:text-dark-foreground tracking-tight">
              Student Reviews &amp; Testimonials
            </h2>
            <p className="mt-4 text-base sm:text-lg text-light-muted dark:text-dark-muted font-normal">
              See how NoteShare is helping engineering students boost their SGPA and ace university exams.
            </p>
          </div>

          {/* Forward & Backward Carousel Buttons */}
          {testimonials.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll backward"
                className="w-12 h-12 rounded-full border border-light-border dark:border-dark-border bg-light-surface/90 dark:bg-dark-surface/90 text-light-foreground dark:text-dark-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:hover:bg-light-surface dark:disabled:hover:bg-dark-surface disabled:hover:text-light-foreground dark:disabled:hover:text-dark-foreground disabled:hover:border-light-border dark:disabled:hover:border-dark-border disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll forward"
                className="w-12 h-12 rounded-full border border-light-border dark:border-dark-border bg-light-surface/90 dark:bg-dark-surface/90 text-light-foreground dark:text-dark-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:hover:bg-light-surface dark:disabled:hover:bg-dark-surface disabled:hover:text-light-foreground dark:disabled:hover:text-dark-foreground disabled:hover:border-light-border dark:disabled:hover:border-dark-border disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonials.length > 0 ? (
          /* Horizontal Scroll Carousel Track */
          <div
            ref={scrollRef}
            onScroll={checkScrollState}
            className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-4 px-1 snap-x snap-mandatory"
          >
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="w-[300px] sm:w-[360px] md:w-[380px] shrink-0 snap-start group relative bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
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
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-8 px-6 bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border rounded-2xl">
            <MessageSquarePlus className="w-12 h-12 text-primary mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground mb-1">
              No Student Reviews Yet
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted mb-6 leading-relaxed">
              Be the first engineering student to leave feedback and share your experience with NoteShare!
            </p>
            <Link
              to="/feedback"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
              <span>Give First Review</span>
            </Link>
          </div>
        )}

        {/* CTA Button below carousel */}
        {testimonials.length > 0 && (
          <div className="mt-12 sm:mt-16 text-center">
            <Link
              to="/feedback"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
              <span>Share Your Experience &amp; Review NoteShare</span>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
