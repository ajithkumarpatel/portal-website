import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { Role, UserProfile } from '../types';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.Student);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user) {
                const userDocRef = db.collection('users').doc(user.uid);
                const userDocSnap = await userDocRef.get();

                if (userDocSnap.exists) {
                    const userData = userDocSnap.data() as UserProfile;
                    if (userData.role === role) {
                        navigate('/'); // Success: Role matches
                    } else {
                        setError('The selected role does not match your account.');
                        await auth.signOut(); // Sign out immediately if role is wrong
                    }
                } else {
                    setError('User profile not found. Please contact an administrator.');
                    await auth.signOut();
                }
            }
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                 setError('Invalid email or password.');
            } else {
                setError('Failed to log in. Please try again.');
            }
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Login to Portal</h2>
                {error && <div className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                         <Select value={role} onChange={(e) => setRole(e.target.value as Role)} required>
                            {Object.values(Role).map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </Select>
                    </div>
                    <Button type="submit" disabled={loading} className="mt-2">
                        {loading ? 'Verifying...' : 'Log In'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-highlight hover:underline">Sign Up</Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;