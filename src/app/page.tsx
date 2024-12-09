'use client';

import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <section id="top" className="top section dark-background">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <h1>You are not signed in</h1>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="top" className="top section dark-background">
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <h1>Welcome, {session.user?.name}</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
