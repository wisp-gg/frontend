module.exports = {
    content: [
        './index.html',
        './public/**/*.html',
        './src/**/*.{js,jsx,ts,tsx,vue}',
        './safelist.txt',
    ],
    theme: {
        extend: {
            colors: {
                current: 'currentColor',

                info: '#00dcef',
                danger: '#c50000',
                warning: '#ffb300',
                success: '#00b300',

                primary: {
                    0: '#A5A4CE',
                    50: '#464570',
                    100: '#333362',
                    200: '#292952',
                    300: '#25254a',
                    400: '#242344',
                    500: '#1d1c39',
                    550: '#1a1a34',
                    600: '#181731',
                    700: '#111138',
                    800: '#121026',
                    900: '#0c0b1b',
                },

                accent: {
                    200: '#26a688',
                    300: '#1cba95',
                    500: '#1ad4a8',
                    600: '#19c79f'
                },

                red: {
                    700: '#c53030',
                },
            },

            height: {
                unset: 'unset'
            },

            animation: {
                slide: 'slide 1.2s ease-in-out infinite'
            },

            keyframes: {
                slide: {
                    '0%': { 'background-position': '-200px 0' },
                    '100%': { 'background-position': 'calc(200px + 100%) 0' }
                }
            }
        },
    },
    plugins: [],
};
