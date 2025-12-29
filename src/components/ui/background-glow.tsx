"use client";

import React from "react";

export function BackgroundGlow() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse dark:bg-violet-500/10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700 dark:bg-indigo-500/10" />
            <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/5 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000 dark:bg-fuchsia-500/10" />
        </div>
    );
}
