"use client"
import React, { Suspense, lazy } from "react";

const RoomComponent = lazy(() => import("@/app/roomcomponent/page"));

const RoomPage = () => {
    return (
        <div>
            <Suspense fallback={ <div style={{
                background: `url("/bg.svg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            className="min-h-screen text-black text-2xl font-bold flex items-center justify-center">Loading...</div>} >
                <RoomComponent />
            </Suspense>
        </div>
    );
};

export default RoomPage;
