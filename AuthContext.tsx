import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ADMIN_EMAILS } from './constants';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously, 
  updateProfile,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  updateUser: (user: User) => void;
  sendVerificationEmail: () => Promise<void>;
  reloadUserStatus: () => Promise<void>;
  isAdmin: boolean;
  isApproved: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkIfAdmin = (email?: string, role?: string) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase().trim();
    return (
      ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === lowerEmail) ||
      role === 'admin' ||
      role === 'exco'
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const defaultName = firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Member' : 'Community Member');
        const defaultEmail = firebaseUser.email || (firebaseUser.isAnonymous ? 'guest@sunnyvalemasjid.org' : '');
        const isAdminUser = checkIfAdmin(defaultEmail);
        const emailVerified = firebaseUser.emailVerified || firebaseUser.isAnonymous || isAdminUser;

        const initialUser: User = {
          uid: firebaseUser.uid,
          name: defaultName,
          email: defaultEmail,
          emailVerified: emailVerified,
          approvalStatus: isAdminUser ? 'approved' : 'pending',
          role: isAdminUser ? 'admin' : 'member',
        };

        setUser(initialUser);
        setIsLoading(false);

        // Fetch or sync profile in Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            const effectiveRole = isAdminUser ? 'admin' : (userData.role || 'member');
            const effectiveApproval = isAdminUser ? 'approved' : (userData.approvalStatus || 'pending');
            const effectiveVerified = isAdminUser ? true : (firebaseUser.emailVerified || firebaseUser.isAnonymous || userData.emailVerified);
            
            setUser(prev => ({
              ...prev,
              ...userData,
              uid: firebaseUser.uid,
              emailVerified: effectiveVerified,
              approvalStatus: effectiveApproval,
              role: effectiveRole,
            }));

            // Sync admin & verification status to firestore if needed
            if (isAdminUser && (userData.role !== 'admin' || userData.approvalStatus !== 'approved' || !userData.emailVerified)) {
              await updateDoc(userDocRef, {
                role: 'admin',
                approvalStatus: 'approved',
                emailVerified: true,
                updatedAt: serverTimestamp()
              });
            } else if (firebaseUser.emailVerified && !userData.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: true,
                updatedAt: serverTimestamp()
              });
            }
          } else {
            // Auto initialize user doc
            const initialDocData: User = {
              uid: firebaseUser.uid,
              name: defaultName,
              email: defaultEmail,
              emailVerified: emailVerified,
              approvalStatus: isAdminUser ? 'approved' : 'pending',
              role: isAdminUser ? 'admin' : 'member',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userDocRef, initialDocData, { merge: true });
          }
        } catch (err) {
          console.warn("User profile background sync:", err);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user is currently signed in.');
    }
  };

  const reloadUserStatus = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      const isVerified = auth.currentUser.emailVerified;
      
      // Update local state and Firestore
      setUser(prev => prev ? ({ ...prev, emailVerified: isVerified }) : null);

      if (isVerified && user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            emailVerified: true,
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn("Error updating emailVerified in firestore:", e);
        }
      }
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const loginAsGuest = async () => {
    try {
      const res = await signInAnonymously(auth);
      if (res.user) {
        await updateProfile(res.user, { displayName: 'Community Guest' });
      }
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const isAdmin = Boolean(user && (checkIfAdmin(user.email, user.role)));
  const isApproved = Boolean(user && (user.approvalStatus === 'approved' || isAdmin));

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loginAsGuest, 
      updateUser, 
      sendVerificationEmail,
      reloadUserStatus,
      isAdmin,
      isApproved,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

