"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("Signing in...");
    
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      
      if (response.error) {
        setError(response.error.message || "Invalid email or password");
        setStatus("");
      } else {
        setStatus("Success! Redirecting...");
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus("");
    }
  };

  const handleDemoSignup = async () => {
    setError("");
    setStatus("Creating demo account...");
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: "demo@instaonpc.com",
        password: "DemoUser!2026",
        name: "Demo Operator",
      });
      if (signUpError) {
        // If user already exists, just sign in
        if (signUpError.message?.includes("already exists")) {
          setStatus("Demo account exists. Signing in...");
        } else {
          setError(signUpError.message);
          setStatus("");
          return;
        }
      }
      // Auto sign-in
      const { error: signInError } = await authClient.signIn.email({
        email: "demo@instaonpc.com",
        password: "DemoUser!2026",
      });
      if (signInError) {
        setError(signInError.message);
        setStatus("");
      } else {
        setStatus("Success! Redirecting...");
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Demo login failed.");
      setStatus("");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--sidebar)', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', width: '320px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Operator Login</h2>
        {error && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        {status && <div style={{ color: '#0d9488', fontSize: '14px', textAlign: 'center' }}>{status}</div>}
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
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', margin: '-4px 0' }}>or</div>
        <button type="button" onClick={handleDemoSignup} style={{ padding: '10px', background: 'transparent', color: '#0d9488', border: '1px solid #0d9488', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Demo Login
        </button>
      </form>
    </div>
  );
}
