import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wrap any route element with this to require a logged-in user.
// Pass `roles` to also restrict by role (e.g. roles={['ADMIN']}).
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full p-10 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-500 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
