import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DownloadCloud, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full py-20 px-4 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full -z-10 animate-pulse" />
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Level Up Your <span className="text-accent">Learning</span> <br /> with NoteShare
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-muted mb-10 leading-relaxed">
          The premium platform to upload, share, and discover expert-level study materials. 
          Join a community of thousands of high-achieving students today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <>
              <Link 
                to="/notes" 
                className="group px-8 py-4 bg-accent text-accent-foreground rounded-field font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20"
              >
                Browse Library
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/upload" 
                className="px-8 py-4 bg-surface-secondary text-foreground border border-border rounded-field font-semibold text-lg hover:bg-surface-tertiary transition-all duration-300"
              >
                Upload Content
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/register" 
                className="group px-8 py-4 bg-accent text-accent-foreground rounded-field font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20"
              >
                Get Started
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-surface-secondary text-foreground border border-border rounded-field font-semibold text-lg hover:bg-surface-tertiary transition-all duration-300"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Stats / Proof */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl border-t border-border/50 pt-10">
          {[
            { label: 'Notes Shared', value: '15k+' },
            { label: 'Active Students', value: '50k+' },
            { label: 'Daily Downloads', value: '2k+' },
            { label: 'Supportive Clubs', value: '100+' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Features Section */}
      <section className="w-full py-24 px-4 bg-surface-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Engineered for Success</h2>
            <p className="text-muted text-lg">Powerful tools to help you manage your academic journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <BookOpen className="text-accent" />, 
                title: 'Curated Materials', 
                desc: 'Access verified study materials structured for maximum retention.' 
              },
              { 
                icon: <Users className="text-accent" />, 
                title: 'Student Network', 
                desc: 'Collaborate with top students from various branches and years.' 
              },
              { 
                icon: <DownloadCloud className="text-accent" />, 
                title: 'Lightning Fast', 
                desc: 'Download your notes instantly with optimized cloud delivery.' 
              },
              { 
                icon: <ShieldCheck className="text-accent" />, 
                title: 'Secure & Private', 
                desc: 'Your data is encrypted and you control who sees your content.' 
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 bg-surface border border-border rounded-field hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto bg-accent p-12 rounded-[2rem] text-center text-accent-foreground relative overflow-hidden shadow-2xl shadow-accent/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20" />
          <h2 className="text-4xl font-bold mb-6">Ready to Ace Your Exams?</h2>
          <p className="text-lg mb-10 opacity-90">Join thousands of students who are already using NoteShare to excel.</p>
          <Link 
            to="/register" 
            className="inline-block px-10 py-4 bg-white text-accent font-bold rounded-field text-lg hover:bg-opacity-90 transition-all duration-300"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
