

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { UserProfile, Role } from '../../types';
import { DEPARTMENTS } from '../../constants';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import Select from '../../components/Select';

const UserEditModal: React.FC<{ user: UserProfile, onClose: () => void, onSave: (updatedUser: UserProfile) => void }> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6 text-white">Edit User: {user.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Name</label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Department</label>
                        <Select name="department" value={formData.department} onChange={handleChange}>
                            {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Role</label>
                        <Select name="role" value={formData.role} onChange={handleChange}>
                            {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                        </Select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersSnapshot = await db.collection("users").get();
            const usersData = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
            setUsers(usersData);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSaveChanges = async (updatedUser: UserProfile) => {
        if (!editingUser) return;
        try {
            const userRef = db.collection('users').doc(editingUser.uid);
            await userRef.update({
                name: updatedUser.name,
                department: updatedUser.department,
                role: updatedUser.role,
            });
            setUsers(users.map(u => u.uid === updatedUser.uid ? updatedUser : u));
            setEditingUser(null);
        } catch (err) {
            console.error(err);
            setError('Failed to update user.');
        }
    };
    
    const handleDeleteUser = async (uid: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                // Note: This only deletes the Firestore record, not the Firebase Auth user.
                // A Cloud Function is required to delete the Auth user.
                await db.collection('users').doc(uid).delete();
                setUsers(users.filter(u => u.uid !== uid));
            } catch (err) {
                console.error(err);
                setError('Failed to delete user.');
            }
        }
    };


    return (
        <DashboardLayout title="Admin Dashboard">
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <Card>
                <h3 className="text-xl font-bold mb-4 text-white">User Management</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-600">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-4"><Spinner/></td></tr>
                            ) : users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.uid} className="border-b border-gray-700 hover:bg-gray-800/50">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">{user.department}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${
                                            user.role === Role.Admin ? 'bg-red-500' :
                                            user.role === Role.Faculty ? 'bg-blue-500' : 'bg-green-500'
                                        }`}>{user.role}</span></td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => setEditingUser(user)} className="text-yellow-400 hover:text-yellow-300">Edit</button>
                                            <button onClick={() => handleDeleteUser(user.uid)} className="text-red-500 hover:text-red-400">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-4">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            {editingUser && (
                <UserEditModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSave={handleSaveChanges} 
                />
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;