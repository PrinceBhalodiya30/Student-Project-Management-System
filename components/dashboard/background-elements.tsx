"use client"

import React from 'react'

export function BackgroundElements() {
    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh-modern opacity-20 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background pointer-events-none z-0" />

            {/* Floating Particles */}
            <div className="particles z-0">
                <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }} />
                <div className="particle" style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }} />
                <div className="particle" style={{ width: '80px', height: '80px', bottom: '20%', left: '20%', animationDelay: '4s' }} />
            </div>
        </>
    )
}
