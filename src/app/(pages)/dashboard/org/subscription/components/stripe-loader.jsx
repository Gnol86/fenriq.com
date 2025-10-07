"use client";

import React, { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import Image from "next/image";

export default function StripeLoader() {
    const containerRef = useRef(null);
    const div1Ref = useRef(null);
    const div2Ref = useRef(null);

    return (
        <div
            className="relative flex items-center justify-between w-64 mx-auto"
            ref={containerRef}
        >
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div2Ref}
                duration={1}
                delay={0}
                startXOffset={35}
                endXOffset={-10}
            />
            <div ref={div1Ref} className="z-50">
                <Image
                    src="/images/stripe.svg"
                    alt="Stripe Logo"
                    width={100}
                    height={100}
                />
            </div>
            <div ref={div2Ref} className="z-50">
                <Image
                    src="/images/logo.png"
                    alt="App Logo"
                    width={50}
                    height={50}
                />
            </div>
        </div>
    );
}
