import { auth } from './firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  const firebaseUser = auth.currentUser;
  
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: firebaseUser?.uid || 'anonymous',
      email: firebaseUser?.email || 'N/A',
      emailVerified: firebaseUser?.emailVerified || false,
      isAnonymous: firebaseUser?.isAnonymous || true,
      providerInfo: firebaseUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || 'N/A',
        email: p.email || 'N/A'
      })) || []
    }
  };

  const errorString = JSON.stringify(errorInfo, null, 2);
  console.error("Firestore Error:", errorString);
  throw new Error(errorString);
};
