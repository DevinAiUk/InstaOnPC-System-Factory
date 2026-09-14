import Link from 'next/link';
export default function NotFound(){return <div className="empty-state"><h1>Project not found</h1><p>This project may have been removed.</p><Link href="/projects" className="button primary">Back to projects</Link></div>;}
