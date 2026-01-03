import { useState } from 'react';
import { createUserProfile } from '../services/userService';
import { User, Car, Check } from 'lucide-react';

export default function Onboarding({ user, onComplete }) {
    const [role, setRole] = useState('customer'); // 'customer' or 'driver'
    const [formData, setFormData] = useState({
        name: user.displayName || '',
        phone1: '',
        phone2: '',
        vehicleType: 'E-Rickshaw', // 'E-Rickshaw', 'Car', 'Bike'
        vehicleImage: '' // URL or placeholder
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createUserProfile(user.uid, {
                ...formData,
                role,
                email: user.email,
                avatar: user.photoURL
            });
            onComplete(); // Notify App to refresh state
        } catch (error) {
            alert("Error saving profile: " + error.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '24px', height: '100dvh', overflowY: 'auto', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome, {user.displayName}!</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>Let's set up your profile to get started.</p>

            {/* Role Selection */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div
                    onClick={() => setRole('customer')}
                    style={{
                        flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
                        border: role === 'customer' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                        background: role === 'customer' ? '#eff6ff' : 'white'
                    }}
                >
                    <div style={{ background: '#bfdbfe', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <User size={20} color="#2563eb" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Customer</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>I want to book rides</p>
                </div>

                <div
                    onClick={() => setRole('driver')}
                    style={{
                        flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
                        border: role === 'driver' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                        background: role === 'driver' ? '#eff6ff' : 'white'
                    }}
                >
                    <div style={{ background: '#bfdbfe', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <Car size={20} color="#2563eb" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Ride Share</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>I want to drive</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="search-input"
                        style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Contact Number 1</label>
                    <input
                        type="tel"
                        value={formData.phone1}
                        onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                        placeholder="+91 00000 00000"
                        className="search-input"
                        style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Contact Number 2 (Optional)</label>
                    <input
                        type="tel"
                        value={formData.phone2}
                        onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                        placeholder="Emergency contact"
                        className="search-input"
                        style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                    />
                </div>

                {/* Conditional Driver Fields */}
                {role === 'driver' && (
                    <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                        <h4 style={{ margin: '0 0 16px', color: '#166534' }}>Vehicle Details</h4>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Vehicle Type</label>
                            <select
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', outline: 'none' }}
                            >
                                <option value="E-Rickshaw">E-Rickshaw</option>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Vehicle Image URL (Optional)</label>
                            <input
                                type="text"
                                value={formData.vehicleImage}
                                onChange={(e) => setFormData({ ...formData, vehicleImage: e.target.value })}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', outline: 'none' }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn"
                    style={{ marginTop: '16px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </button>

            </form>
        </div>
    );
}
