"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isSignUp) {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: "Operator",
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
    }
    
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    
    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/projects");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--sidebar)', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', width: '320px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>{isSignUp ? "Create Admin" : "Operator Login"}</h2>
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
          {isSignUp ? "Create User" : "Sign In"}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'transparent', border: 'none', color: '#0d9488', cursor: 'pointer', fontSize: '12px', marginTop: '-8px' }}>
          {isSignUp ? "Back to Login" : "First time? Create Admin"}
        </button>
      </form>
    </div>
  );
}
