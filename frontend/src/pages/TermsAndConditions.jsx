import React from 'react';
import { BookOpen, AlertTriangle, ShieldAlert, FileText, CheckCircle2, HelpCircle } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 sm:pt-16 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-light-foreground dark:text-dark-foreground">
            Terms &amp; Conditions of Use
          </h1>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted max-w-lg mx-auto font-sans">
            Please read these terms and academic disclaimers carefully before using NoteShare.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* Section 1: Academic Purpose & Access */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              <span>1. Academic Purpose &amp; Access</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              NoteShare is an independent educational platform created strictly for personal academic study, revision, and coursework preparation. By accessing our platform, you agree to utilize notes and Previous Year Question Papers (PYQs) solely for self-study and learning purposes.
            </p>
          </div>

          {/* Section 2: Availability of Documents & PYQs */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <span>2. Availability of Study Documents &amp; PYQs</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              We make study notes and previous year question papers available in an organized, centralized repository to help students prepare for their exams. NoteShare acts purely as an access and viewing platform for these academic resources.
            </p>
          </div>

          {/* Section 3: No Exam Question Guarantee */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 sm:p-8 space-y-3 bg-amber-500/[0.03] shadow-sm">
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>3. No Guarantee of Examination Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              <strong>We do not guarantee or warrant that any examination question will be selected from or covered in our study notes or past papers.</strong> Examination question papers are set independently by university authorities, faculties, and official examination boards. Students should not rely exclusively on any single source for exam preparation.
            </p>
          </div>

          {/* Section 4: Non-Exhaustive Question Paper Archive */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" />
              <span>4. Question Paper Archive Limitations</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              While we continually endeavor to collect, archive, and update academic resources, <strong>NoteShare may not have all question papers or past examination cycles</strong> for every subject, semester, or engineering branch. Availability depends on academic records, curriculum changes, and community contributions.
            </p>
          </div>

          {/* Section 5: Supplementary Study Aid & Textbook Advisory */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span>5. Supplementary Reference Aid</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              The notes and summaries hosted on NoteShare are intended solely as supplementary reference material and rapid revision aids. They are not intended as a replacement for standard university textbooks, faculty lectures, or the official prescribed syllabus. While materials are curated with care, students are encouraged to cross-reference important concepts, equations, and solutions with authorized academic literature.
            </p>
          </div>

          {/* Section 6: No Affiliation & Disclaimer of Liability */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
              <span>6. Institutional Affiliation &amp; Academic Outcomes</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              NoteShare is an independent platform and is not affiliated, authorized, endorsed, or officially connected with any university, autonomous college, or examination body. NoteShare bears no responsibility or liability for individual examination marks, academic grading, or performance outcomes.
            </p>
          </div>

          {/* Section 7: Protected Content & Restrictions */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span>7. Protected Content &amp; Restrictions</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              All study notes and question papers hosted on NoteShare are subject to proprietary security and viewing protection. Users are strictly prohibited from attempting to bypass anti-screenshot controls, record screens, extract digital assets, or redistribute materials externally without authorization.
            </p>
          </div>

          {/* Section 8: Account Responsibility */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span>8. Account Responsibility</span>
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Users are responsible for maintaining the confidentiality of their credentials and activity under their accounts. NoteShare reserves the right to suspend or terminate accounts that violate these terms or attempt security breaches.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
