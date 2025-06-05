import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <AlertOctagon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          404
        </h1>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;