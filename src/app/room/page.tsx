"use client"
import React, { Suspense, lazy } from "react";

const RoomComponent = lazy(() => import("@/app/roomcomponent/page"));

const RoomPage = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <RoomComponent />
            </Suspense>
        </div>
    );
};

export default RoomPage;
