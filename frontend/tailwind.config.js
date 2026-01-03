/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Grayscale theme - black, white, and grays only
                'dark-bg': '#000000',
                'dark-card': '#1a1a1a',
                'dark-border': '#2a2a2a',
                'dark-hover': '#2f2f2f',
                'text-primary': '#ffffff',
                'text-secondary': '#a0a0a0',
                'text-muted': '#666666',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
