import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Link2Off, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      
      {/* Icon & 404 Text */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <Link2Off className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-7xl font-extrabold tracking-tight lg:text-9xl text-primary">
          404
        </h1>
      </div>

      {/* Messaging */}
      <div className="space-y-3 mb-10 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dead Link or Page Not Found
        </h2>
        <p className="text-muted-foreground">
          Oops! The page or short link you are looking for doesn't exist, has expired, or might have been moved.
        </p>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
        <Link 
          href="/" 
          className={buttonVariants({ variant: "default", className: "w-full sm:w-auto flex items-center gap-2" })}
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link 
          href="/dashboard" 
          className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto flex items-center gap-2" })}
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
      
    </div>
  );
}