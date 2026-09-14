'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty-state" role="alert"><h1>The workspace could not load.</h1><p>Your saved data has not been reset. Check storage configuration and try again.</p><button className="button primary" onClick={reset}>Try again</button></div>;}
