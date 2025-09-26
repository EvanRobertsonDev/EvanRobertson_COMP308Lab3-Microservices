// shell-app/src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';
import './App.css';
const UserApp = lazy(() => import('userApp/App'));
const VitalSignsApp = lazy(() => import('vitalsignsApp/App'));
// GraphQL query to check the current user's authentication status
const CURRENT_USER_QUERY = gql`
query CurrentUser {
currentUser {
username
}
}
`;
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Use Apollo's useQuery hook to perform the authentication status check on app
  const { loading, error, data } = useQuery(CURRENT_USER_QUERY, {
  fetchPolicy: 'network-only',
  });
  useEffect(() => {
  // Listen for the custom loginSuccess event from the UserApp
  const handleLoginSuccess = (event) => {
  setIsLoggedIn(event.detail.isLoggedIn);
  };
  window.addEventListener('loginSuccess', handleLoginSuccess);
  // Check the authentication status based on the query's result
  if (!loading && !error) {
  setIsLoggedIn(!!data.currentUser);
  }
  return () => {
  window.removeEventListener('loginSuccess', handleLoginSuccess);
  };
  }, [loading, error, data]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;
  return (
  <div className="App">
  <Suspense fallback={<div>Loading...</div>}>
  {!isLoggedIn ? <UserApp /> : <VitalSignsApp />}
  </Suspense>
  </div>
  );
  }
  export default App;