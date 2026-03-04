import typography from '@tailwindcss/typography'
import tailwindAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-primary': 'var(--accent-primary)',
                'sidebar': 'var(--bg-sidebar)',
                'surface': 'var(--bg-primary)',
                'card': 'var(--bg-card)',
                'modal': 'var(--modal-bg)',
                'primary': 'var(--text-primary)',
                'secondary': 'var(--text-secondary)',
                'divider': 'var(--border-color)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-in-up': 'fade-in-up 0.5s ease-out',
            },
        },
    },
    plugins: [
        typography,
        tailwindAnimate,
    ],
}
