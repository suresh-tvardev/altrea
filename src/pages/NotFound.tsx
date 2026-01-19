import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Page Not Found"
        description="The page you're looking for doesn't exist"
        icon={AlertCircle}
        backTo="/"
      />

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-alert/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-alert" />
        </div>
        
        <h2 className="text-4xl font-bold text-foreground mb-4">404</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back on track.
        </p>

        <div className="flex gap-4">
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
