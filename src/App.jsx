import React, { useState, useEffect } from 'react'
import MapComponent from './components/Map'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import EditProfile from './components/EditProfile'
import { useVehicleData } from './hooks/useVehicleData'
import { auth, logout } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { requestRide, subscribeToRiderBookings, subscribeToDriverBookings, updateRideStatus } from './services/rideService'
import { getUserProfile } from './services/userService'
import { MapPin, Navigation, Search, Home, BookOpen, User, Phone, Star, ChevronRight, Bell } from 'lucide-react'

function App() {
    // --- STATE & HOOKS ---
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [destination, setDestination] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // For filtering drivers
    const [riderBookings, setRiderBookings] = useState([]);
    const [driverRequests, setDriverRequests] = useState([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Custom Hook
    const { vehicles, userLocation, isDriver, toggleDriverMode } = useVehicleData(user);

    // 1. Auth & Profile Effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    const profile = await getUserProfile(currentUser.uid);
                    setUserProfile(profile);
                } else {
                    setUserProfile(null);
                }
                setUser(currentUser);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setUser(currentUser);
            } finally {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Rider Bookings Effect
    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToRiderBookings(user.uid, (bookings) => {
            setRiderBookings(bookings);
        });
        return () => unsub();
    }, [user]);

    // 3. Driver Requests Effect
    useEffect(() => {
        if (!user || !userProfile || userProfile.role !== 'driver') return;
        // Note: checking isDriver local state might be better if we sync it with profile, 
        // but 'isDriver' from useVehicleData is the "Active Mode" toggle.
        // The requirements say "Ride Share" users see requests. 
        // Let's assume we want to show requests if they are 'driver' role AND in 'driver mode' (optional) 
        // OR just if they are 'driver' role.
        // For now, let's stick to the previous logic but safe guard it.

        // Original logic checked 'isDriver' (the toggle). Let's keep that if it exists.
        if (!isDriver) return;

        const unsub = subscribeToDriverBookings(user.uid, (requests) => {
            setDriverRequests(requests);
            if (requests.length > 0) {
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            }
        });
        return () => unsub();
    }, [user, userProfile, isDriver]);


    // 4. Auto-switch to Map when going Online
    useEffect(() => {
        if (isDriver) {
            setActiveTab('map');
        }
    }, [isDriver]);

    // --- HANDLERS ---
    const handleOnboardingComplete = async () => {
        if (user) {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
        }
    };

    const handleBookRide = async () => {
        if (!selectedVehicle) return;
        try {
            await requestRide(selectedVehicle.id, user.uid, user.displayName || "Rider", userLocation, destination);
            alert("Ride Requested! Creating booking...");
            setActiveTab('book');
            setSelectedVehicle(null);
        } catch (error) {
            alert("Error booking ride: " + error.message);
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setActiveTab('map');
    };

    const confirmLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    // --- EARLY RETURNS (Protected Views) ---
    if (isLoading) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    if (!user) {
        return <Login onLogin={setUser} />;
    }

    if (!userProfile) {
        return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
    }

    if (isEditing) {
        return (
            <EditProfile
                user={user}
                userProfile={userProfile}
                onComplete={async () => {
                    // Refresh profile
                    const p = await getUserProfile(user.uid);
                    setUserProfile(p);
                    setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    // --- RENDER LOGIC ---

    const renderDriverView = () => {
        switch (activeTab) {
            case 'home': // Driver Dashboard
                return (
                    <div className="view-container section-padding" style={{ overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '24px' }}>Dashboard</h2>

                        {/* Status Card */}
                        <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', borderTop: isDriver ? '4px solid #166534' : '4px solid #94a3b8' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                                background: isDriver ? '#dcfce7' : '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Navigation size={40} color={isDriver ? '#166534' : '#64748b'} />
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                                {isDriver ? "You are Online" : "You are Offline"}
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                {isDriver ? "Riders can see your location and request rides." : "Go online to start receiving ride requests."}
                            </p>

                            <button
                                onClick={toggleDriverMode}
                                className="btn"
                                style={{
                                    background: isDriver ? '#ef4444' : '#166534',
                                    width: '100%', maxWidth: '200px', margin: '0 auto'
                                }}
                            >
                                {isDriver ? "Go Offline" : "Go Online"}
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>Pending Requests</h4>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                                    {driverRequests.length}
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>Today's Earnings</h4>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                                    ₹0
                                </div>
                            </div>
                        </div>

                        {/* Profile Summary */}
                        <div className="card" style={{ marginTop: '24px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={userProfile?.avatar || "https://i.pravatar.cc/150?u=driver"} alt="" className="avatar" />
                            <div>
                                <h4 style={{ margin: 0 }}>{userProfile?.name}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{userProfile?.vehicleType} • {userProfile?.phone1}</p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <ChevronRight size={20} color="#cbd5e1" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                    </div>
                );
            case 'map':
                return (
                    <div style={{ width: '100%', height: 'calc(100% - 64px)', position: 'relative' }}>
                        <MapComponent
                            center={userLocation}
                            vehicles={[...vehicles, { ...userProfile, lat: userLocation[0], lng: userLocation[1], id: user.uid, avatar: userProfile?.avatar }]}
                            selectedVehicle={null}
                            onVehicleSelect={() => { }}
                        />
                        {/* Only show "Broadcasting" overlay if actually online */}
                        {isDriver && (
                            <div className="ui-overlay" style={{ top: 'auto', bottom: '24px' }}>
                                <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>You are Live</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>Broadcasting to riders...</p>
                                    </div>
                                    <div className="status-badge status-active" style={{ fontSize: '12px' }}>Online</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'book': // Incoming Requests
                return (
                    <div className="view-container section-padding">
                        <h2 style={{ marginBottom: '24px' }}>Ride Requests</h2>
                        {driverRequests.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                <div style={{ background: '#f0fdf4', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Bell size={40} color="#166534" />
                                </div>
                                <h3>No new requests</h3>
                                <p style={{ fontSize: '14px', maxWidth: '240px', margin: '8px auto 24px' }}>Waiting for nearby riders...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {driverRequests.map(req => (
                                    <div key={req.id} className="card" style={{ padding: '16px', borderLeft: '4px solid #2563eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{req.riderName}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Now</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <MapPin size={16} color="#64748b" />
                                            <span style={{ fontSize: '14px' }}>{req.destination}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn" style={{ flex: 1, background: '#ef4444' }} onClick={() => updateRideStatus(req.id, 'rejected')}>
                                                Decline
                                            </button>
                                            <button className="btn" style={{ flex: 1 }} onClick={() => updateRideStatus(req.id, 'accepted')}>
                                                Accept Ride
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return renderProfile();
            default:
                return null;
        }
    };

    const renderCustomerView = () => {
        switch (activeTab) {
            case 'home':
                // Filter vehicles
                const filteredVehicles = vehicles.filter(v =>
                    v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                return (
                    <div className="view-container section-padding">
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ margin: '0 0 16px' }}>Find a Ride</h2>
                            <div className="card search-bar">
                                <Search size={20} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Search drivers by name..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>Nearby ({filteredVehicles.length})</h3>
                        </div>

                        {filteredVehicles.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                <div style={{ background: '#f1f5f9', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Search size={30} color="#94a3b8" />
                                </div>
                                <p>{searchTerm ? "No drivers found matching your search." : "No drivers nearby."}</p>
                            </div>
                        ) : (
                            filteredVehicles.map(v => (
                                <div key={v.id} className="card vehicle-card" onClick={() => handleVehicleSelect(v)} style={{ cursor: 'pointer', marginBottom: '16px' }}>
                                    <img src={v.avatar} alt={v.driver} className="avatar" />
                                    <div className="vehicle-details" style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>{v.driver}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>{v.vehicleType || "E-Rickshaw"}</p>
                                            {v.distance && (
                                                <span style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>
                                                    {v.distance.toFixed(1)} km away
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <button className="btn" style={{ padding: '6px 12px', fontSize: '12px', height: 'auto' }}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            )))}
                    </div>
                );
            case 'map':
                return (
                    <div style={{ width: '100%', height: 'calc(100% - 64px)', position: 'relative' }}>
                        <MapComponent
                            center={userLocation}
                            vehicles={vehicles}
                            selectedVehicle={selectedVehicle}
                            onVehicleSelect={setSelectedVehicle}
                        />
                        <div className="ui-overlay" style={{ height: 'auto' }}>
                            <div className="interactive-element card search-bar">
                                <Search size={20} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Where to?"
                                    className="search-input"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                        </div>
                        {selectedVehicle && (
                            <div className="ui-overlay" style={{ justifyContent: 'flex-end', pointerEvents: 'none', paddingBottom: '24px' }}>
                                <div className="interactive-element card" style={{ padding: '20px', width: '100%', maxWidth: '480px', margin: '0 auto', pointerEvents: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <img src={selectedVehicle.avatar} alt={selectedVehicle.driver} className="avatar" />
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedVehicle.driver}</h3>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{selectedVehicle.name}</p>
                                            </div>
                                        </div>
                                        <div className="status-badge status-active">Online</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn" onClick={handleBookRide} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Navigation size={18} /> Book Ride
                                        </button>
                                        <button className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                            <Phone size={20} color="#2563eb" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'book':
                return (
                    <div className="view-container section-padding">
                        <h2 style={{ marginBottom: '24px' }}>Your Bookings</h2>
                        {riderBookings.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <BookOpen size={40} color="#94a3b8" />
                                </div>
                                <h3>No active rides</h3>
                                <p style={{ fontSize: '14px', maxWidth: '240px', margin: '8px auto 24px' }}>You haven't booked any E-Rickshaws yet. Start your journey today!</p>
                                <button className="btn" onClick={() => setActiveTab('home')}>Find Nearby Rides</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {riderBookings.map(booking => (
                                    <div key={booking.id} className="card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold' }}>To: {booking.destination}</span>
                                            <span style={{
                                                fontSize: '12px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                background: booking.status === 'pending' ? '#fef9c3' : '#dcfce7',
                                                color: booking.status === 'pending' ? '#854d0e' : '#166534'
                                            }}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Driver ID: {booking.driverId}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return renderProfile();
            default:
                return null;
        }
    };

    const renderProfile = () => (
        <div className="view-container section-padding">
            <div className="profile-header">
                <div style={{ position: 'relative', width: '100px', margin: '0 auto 16px' }}>
                    <img src={userProfile?.avatar || user.photoURL || "https://i.pravatar.cc/150?u=user"} alt="User" className="avatar" style={{ width: '100px', height: '100px' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563eb', padding: '6px', borderRadius: '50%', color: 'white', border: '2px solid white' }}>
                        <User size={14} />
                    </div>
                </div>
                <h2 style={{ margin: 0 }}>{userProfile?.name || user.displayName}</h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{userProfile?.phone1 || user.email}</p>
                <div style={{ marginTop: '8px' }}>
                    <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                        {userProfile?.role}
                    </span>
                </div>
            </div>

            {userProfile?.role === 'driver' && (
                <>
                    <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', marginBottom: '12px' }}>Driver Controls</h4>
                    <div className="settings-list" style={{ marginBottom: '24px' }}>
                        <div className="settings-item" onClick={toggleDriverMode} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Navigation size={18} color={isDriver ? "#166534" : "#64748b"} />
                                <span style={{ fontWeight: isDriver ? 'bold' : 'normal', color: isDriver ? '#166534' : 'inherit' }}>
                                    {isDriver ? "Driver Mode Active" : "Switch to Driver Mode"}
                                </span>
                            </div>
                            <div style={{
                                width: '40px', height: '24px', background: isDriver ? '#22c55e' : '#e2e8f0',
                                borderRadius: '99px', position: 'relative', transition: 'background 0.3s'
                            }}>
                                <div style={{
                                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '2px', left: isDriver ? '18px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', marginBottom: '12px' }}>Account Settings</h4>
            <div className="settings-list">
                <div className="settings-item" style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={18} color="#64748b" />
                        <span>Edit Profile</span>
                    </div>
                    <ChevronRight size={18} color="#cbd5e1" />
                </div>
                <div className="settings-item" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => setShowLogoutConfirm(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={18} />
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="app-container" style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>

            {userProfile?.role === 'driver' ? renderDriverView() : renderCustomerView()}

            {/* Driver Request Modal */}
            {driverRequests.length > 0 && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center' }}>
                        <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Bell size={32} color="#166534" />
                        </div>
                        <h3>New Ride Request!</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            {driverRequests[0].riderName} wants to go to:<br />
                            <strong>{driverRequests[0].destination}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn" style={{ flex: 1, background: '#ef4444' }} onClick={() => updateRideStatus(driverRequests[0].id, 'rejected')}>
                                Decline
                            </button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => updateRideStatus(driverRequests[0].id, 'accepted')}>
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center' }}>
                        <div style={{ background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <User size={32} color="#ef4444" />
                        </div>
                        <h3>Log Out?</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            Are you sure you want to log out?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#1e293b' }} onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn" style={{ flex: 1, background: '#ef4444' }} onClick={confirmLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                    <Home size={24} />
                    <span>Home</span>
                </button>
                <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
                    <MapPin size={24} />
                    <span>Map</span>
                </button>
                <button className={`nav-item ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
                    {userProfile?.role === 'driver' ? <Bell size={24} /> : <BookOpen size={24} />}
                    <span>{userProfile?.role === 'driver' ? 'Requests' : 'Book'}</span>
                </button>
                <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <User size={24} />
                    <span>Profile</span>
                </button>
            </nav>
        </div>
    )
}

export default App
