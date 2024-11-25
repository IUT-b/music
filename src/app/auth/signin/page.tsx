'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// import SignInButton from "../../components/SignInButton";

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status]);

  return (
    <div>
      <h1>Sign In with Spotify</h1>
      {/* <SignInButton /> */}
    </div>
  );
};
