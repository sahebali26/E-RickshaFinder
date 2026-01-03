import React, { useState, useRef } from 'react';
import { updateUserProfile } from '../services/userService';
import { User, Car, Camera, ArrowLeft, Save } from 'lucide-react';

export default function EditProfile({ user, userProfile, onComplete, onCancel }) {
    const [formData, setFormData] = useState({
        name: userProfile?.name || user.displayName || '',
        phone1: userProfile?.phone1 || '',
        phone2: userProfile?.phone2 || '',
        role: userProfile?.role || 'customer',
        vehicleType: userProfile?.vehicleType || 'E-Rickshaw',
        vehicleImage: userProfile?.vehicleImage || '',
        avatar: userProfile?.avatar || user.photoURL || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const vehicleFileInputRef = useRef(null);

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit check
                alert("File size too large. Please upload an image smaller than 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateUserProfile(user.uid, formData);
            alert("Profile updated successfully!");
            onComplete();
        } catch (error) {
            alert("Error updating profile: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '24px', height: '100dvh', overflowY: 'auto', background: '#f8fafc', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="#1e293b" />
                </button>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Edit Profile</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Avatar Section */}
                <div style={{ textAlign: 'center', position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                    <img
                        src={formData.avatar || "https://i.pravatar.cc/150?u=user"}
                        alt="Profile"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: '#2563eb', color: 'white', border: 'none',
                            borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Camera size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                </div>

                {/* Personal Info */}
                <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>Personal Details</h3>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="search-input"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone1}
                            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                            className="search-input"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Emergency Contact</label>
                        <input
                            type="tel"
                            value={formData.phone2}
                            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                            className="search-input"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>

                {/* Role Switcher */}
                <div className="card" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#64748b' }}>Account Role</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'customer' })}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid',
                                borderColor: formData.role === 'customer' ? '#2563eb' : '#e2e8f0',
                                background: formData.role === 'customer' ? '#eff6ff' : 'white',
                                color: formData.role === 'customer' ? '#2563eb' : '#64748b',
                                fontWeight: '600'
                            }}
                        >
                            Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'driver' })}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid',
                                borderColor: formData.role === 'driver' ? '#2563eb' : '#e2e8f0',
                                background: formData.role === 'driver' ? '#eff6ff' : 'white',
                                color: formData.role === 'driver' ? '#2563eb' : '#64748b',
                                fontWeight: '600'
                            }}
                        >
                            Ride Share
                        </button>
                    </div>
                </div>

                {/* Vehicle Details (Conditional) */}
                {formData.role === 'driver' && (
                    <div className="card" style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#166534' }}>Vehicle Information</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Vehicle Type</label>
                            <select
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="E-Rickshaw">E-Rickshaw</option>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Vehicle Photo</label>

                            {formData.vehicleImage ? (
                                <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <img src={formData.vehicleImage} alt="Vehicle" style={{ width: '100%', borderRadius: '8px', height: '150px', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vehicleImage: '' })}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                                    >Change</button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => vehicleFileInputRef.current.click()}
                                    style={{
                                        border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px',
                                        textAlign: 'center', cursor: 'pointer', background: 'white'
                                    }}
                                >
                                    <div style={{ background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                        <Camera size={20} color="#94a3b8" />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Tap to upload vehicle photo</p>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={vehicleFileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'vehicleImage')}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn"
                    style={{ height: '56px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}
                >
                    <Save size={20} />
                    {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
                </button>

            </form>
        </div>
    );
}
