import React from 'react';
import Link from 'next/link';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center">
      <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-lg">You do not have the necessary permissions to view this page.</p>
      <p className="mt-2 text-gray-600">If you believe this is an error, please contact an administrator.</p>
      <Link href="/" className="mt-6 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
        Go to Homepage
      </Link>
    </div>
  );
};

export default UnauthorizedPage; 