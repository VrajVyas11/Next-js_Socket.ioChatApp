"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const RoomComponent = dynamic(() => import("@/app/roomcomponent/page"), {
  ssr: false,
});

const RoomPage = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: `url("/bg.svg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="min-h-screen text-black text-2xl font-bold flex items-center justify-center"
        >
          Loading...
        </div>
      }
    >
      <RoomComponent />
    </Suspense>
  );
};

export default RoomPage;
