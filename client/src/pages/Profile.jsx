import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, GraduationCap, Building2, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [year, setYear] = useState(user?.year || 'First Year');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const yearOptions = [
    { label: 'First Year', value: 'First Year' },
    { label: 'Second Year', value: 'Second Year' },
    { label: 'Third Year', value: 'Third Year' },
    { label: 'Fourth Year', value: 'Fourth Year' },
  ];

  const branchOptions = [
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Information Technology', value: 'Information Technology' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const res = await updateProfile(year, branch);
    if (res.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  if (!user) return (
    <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-accent" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
            <User size={40} />
        </div>
        <h2 className="text-4xl font-bold text-foreground">Your Profile</h2>
        <p className="text-muted mt-2">Manage your academic identity and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl">
                <div className="space-y-6">
                    <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Full Name</span>
                        <p className="text-lg font-bold text-foreground flex items-center gap-2">
                            <User size={18} className="text-accent" />
                            {user.name}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Email Address</span>
                        <p className="text-sm font-medium text-foreground flex items-center gap-2 break-all">
                            <Mail size={16} className="text-accent" />
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-[2rem] p-8">
                <h4 className="font-bold text-accent mb-2">Student Status</h4>
                <p className="text-sm text-foreground/70 leading-relaxed">Your year and branch help us personalize your feed and connect you with relevant study groups.</p>
            </div>
        </div>

        {/* Main Settings Form */}
        <div className="md:col-span-2">
            <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {message && (
                <div className="mb-8 p-4 bg-success/10 border border-success/20 text-success rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle size={18} />
                    {message}
                </div>
                )}
                
                {error && (
                <div className="mb-8 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-200">
                    <AlertCircle size={18} />
                    {error}
                </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <CustomSelect 
                            label="Academic Year"
                            options={yearOptions}
                            value={year}
                            onChange={setYear}
                            icon={GraduationCap}
                        />
                        
                        <CustomSelect 
                            label="Department/Branch"
                            options={branchOptions}
                            value={branch}
                            onChange={setBranch}
                            icon={Building2}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <Save size={20} />
                        )}
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
