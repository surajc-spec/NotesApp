import React from 'react';
import { BookOpen, Users, ShieldAlert, Award, Star, Compass } from 'lucide-react';
import AdUnit from '../components/AdUnit';

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <AdUnit placement="top" className="mb-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6 shadow-xl shadow-accent/5">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">About NoteShare</h1>
        <p className="text-muted mt-3 text-sm md:text-base">
          A secure, community-driven academic library tailored specifically to your branch and year.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Core Vision Banner */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              Academic resources are most effective when tailored to specific syllabus branches and semesters. We realized students spend countless hours searching for accurate notes and lecture slides, while note-creators struggle to share their hard work out of fear that their documents will be downloaded, repackaged, or distributed across external networks without their credit.
            </p>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              <strong className="text-foreground">NoteShare solves this.</strong> We offer a protected classroom-like academic ecosystem where students can seamlessly discover notes from peer experts in their precise year and branch. Creators can share their work confidently knowing our advanced streaming mechanism disables downloads, copy-paste, and screenshot operations.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-4 hover:border-accent/40 transition-colors shadow-lg">
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center text-accent">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Community Centric</h3>
            <p className="text-muted text-sm leading-relaxed">
              No generic clutter. We organize documents strictly matching your specific year and college branch for quick navigation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-4 hover:border-accent/40 transition-colors shadow-lg">
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center text-accent">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Anti-Copy Secure</h3>
            <p className="text-muted text-sm leading-relaxed">
              Advanced secure streaming, watermarked previews, right-click blocks, and console barriers prevent unauthorized downloads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-4 hover:border-accent/40 transition-colors shadow-lg">
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center text-accent">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">100% Free</h3>
            <p className="text-muted text-sm leading-relaxed">
              Supported through light advertisements. No paid subscriptions, paywalls, or fees. High-quality study material for everyone.
            </p>
          </div>

        </div>

        {/* Core Values */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center md:text-left">Why We Built NoteShare</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="p-2 bg-success/10 text-success rounded-lg h-fit shrink-0">
                <Star size={20} />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Empowering Student Content Creators</h4>
                <p className="text-muted text-sm mt-1 leading-relaxed">
                  We believe students who take excellent notes should be celebrated and credited, not taken advantage of. Our environment keeps their authorship respected and secured.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 bg-success/10 text-success rounded-lg h-fit shrink-0">
                <Compass size={20} />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Streamlining Exam Preparation</h4>
                <p className="text-muted text-sm mt-1 leading-relaxed">
                  Say goodbye to disorganized WhatsApp threads or messy Google Drives. Our dashboard groups files by subjects alphabetically for effortless studying.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <AdUnit placement="footer" className="mt-12" />
    </div>
  );
};

export default AboutUs;
