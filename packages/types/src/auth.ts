export interface customJwtSessionClaims {
  metadata?: {
    role?: 'user' | 'admin';
  };
}
