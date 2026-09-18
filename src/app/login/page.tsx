"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      
      if (response.error) {
        setError(response.error.message || "Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Check browser console.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--sidebar)', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', width: '320px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Operator Login</h2>
        {error && <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'white' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'white' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
