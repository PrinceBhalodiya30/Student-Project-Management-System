"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
    from?: number
    to: number
    duration?: number
    className?: string
}

export function AnimatedCounter({ from = 0, to, duration = 2000, className = "" }: AnimatedCounterProps) {
    const [count, setCount] = useState(from)
    const [hasAnimated, setHasAnimated] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        // Reset animation when 'to' value changes
        setHasAnimated(false);
        setCount(from);
    }, [to, from]);

    useEffect(() => {
        if (hasAnimated) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasAnimated(true)
                    const startTime = Date.now()
                    const endTime = startTime + duration

                    const updateCount = () => {
                        const now = Date.now()
                        const progress = Math.min((now - startTime) / duration, 1)

                        // Easing function for smooth animation
                        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                        const currentCount = Math.floor(from + (to - from) * easeOutQuart)

                        setCount(currentCount)

                        if (now < endTime) {
                            requestAnimationFrame(updateCount)
                        } else {
                            setCount(to)
                        }
                    }

                    requestAnimationFrame(updateCount)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [from, to, duration, hasAnimated])

    return <span ref={ref} className={className}>{count}</span>
}
