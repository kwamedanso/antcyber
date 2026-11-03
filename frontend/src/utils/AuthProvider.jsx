// utils/AuthProvider.jsx
import { createContext, useState, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);

    // Stable context value — prevents every consumer from re-rendering
    // when unrelated state changes elsewhere in the tree.
    const value = useMemo(
        () => ({ auth, setAuth, loading, setLoading }),
        [auth, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;