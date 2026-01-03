import { loginWithGoogle } from "../lib/firebase";
import { Zap } from "lucide-react";

export default function Login({ onLogin }) {
    const handleLogin = async () => {
        try {
            const user = await loginWithGoogle();
            onLogin(user);
        } catch (error) {
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100dvh',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            padding: '24px',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'white',
                padding: '32px 24px',
                borderRadius: '24px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                width: '100%',
                maxWidth: '360px'
            }}>
                <div style={{
                    background: '#eff6ff',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Zap size={40} color="#2563eb" fill="#2563eb" />
                </div>

                <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#1e293b' }}>Ride Fast</h1>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>Find E-Rickshaws nearby instantly.</p>

                <button
                    onClick={handleLogin}
                    style={{
                        background: '#1e293b',
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '12px',
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="20" height="20" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
