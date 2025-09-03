import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { Role, UserProfile } from '../types';
import { FACULTY_REGISTRATION_CODE, ADMIN_REGISTRATION_CODE, DEPARTMENTS, YEARS } from '../constants';

import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';

const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [year, setYear] = useState(YEARS[0]);
    const [registrationCode, setRegistrationCode] = useState('');
    const [isStudent, setIsStudent] = useState(true);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let role: Role = Role.Student;
        if (!isStudent) {
            if (registrationCode === FACULTY_REGISTRATION_CODE) {
                role = Role.Faculty;
            } else if (registrationCode === ADMIN_REGISTRATION_CODE) {
                role = Role.Admin;
            } else {
                setError('Invalid registration code.');
                setLoading(false);
                return;
            }
        }

        try {
            // Fix: Use v8 createUserWithEmailAndPassword method
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user) {
              throw new Error("User could not be created.");
            }

            const userProfile: UserProfile = {
                uid: user.uid,
                name,
                email,
                department,
                role,
                ...(role === Role.Student && { year }),
            };

            // Fix: Use v8 firestore syntax
            await db.collection('users').doc(user.uid).set(userProfile);
            navigate('/');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered.');
            } else {
                setError('Failed to create an account.');
            }
            console.error(err);
        }

        setLoading(false);
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>
                {error && <div className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}
                
                <div className="flex justify-center mb-6">
                    <button onClick={() => setIsStudent(true)} className={`px-4 py-2 rounded-l-lg ${isStudent ? 'bg-highlight text-white' : 'bg-secondary text-gray-300'}`}>Student</button>
                    <button onClick={() => setIsStudent(false)} className={`px-4 py-2 rounded-r-lg ${!isStudent ? 'bg-highlight text-white' : 'bg-secondary text-gray-300'}`}>Faculty/Admin</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                        {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </Select>
                    {isStudent && (
                        <Select value={year} onChange={(e) => setYear(e.target.value)} required>
                           {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    )}
                    {!isStudent && (
                        <Input type="text" placeholder="Registration Code" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} required />
                    )}
                    <Button type="submit" disabled={loading} className="mt-2">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-highlight hover:underline">Log In</Link>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
