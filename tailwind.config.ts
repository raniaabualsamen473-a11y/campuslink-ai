
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				campus: {
					blue: '#1A365D',
					teal: '#2C7A7B',
					lightBlue: '#4299E1',
					gray: '#F7FAFC',
					darkGray: '#2D3748',
					purple: '#9b30ff',
					lightPurple: '#b980ff',
					darkPurple: '#7a1dce',
					neonPurple: '#b035ff',
					deepPurple: '#5e0cb0',
					glass: 'rgba(255, 255, 255, 0.1)',
					darkGlass: 'rgba(15, 23, 42, 0.3)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px 2px rgba(155, 48, 255, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 15px 5px rgba(155, 48, 255, 0.6)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'theme-toggle': {
					'0%': { 
						transform: 'rotate(0deg) scale(0.8)',
						opacity: '0.5'
					},
					'50%': { 
						transform: 'rotate(180deg) scale(1.2)',
						opacity: '1'
					},
					'100%': { 
						transform: 'rotate(360deg) scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.5s ease-out',
				'glow-pulse': 'glow-pulse 2s infinite',
				'float': 'float 3s ease-in-out infinite',
				'theme-toggle': 'theme-toggle 0.5s ease-in-out'
			},
			backgroundImage: {
				'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
				'glass-shine': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'purple-gradient': 'linear-gradient(135deg, #7a1dce 0%, #9b30ff 50%, #b980ff 100%)',
				'neon-glow': 'linear-gradient(135deg, rgba(155, 48, 255, 0.5) 0%, rgba(155, 48, 255, 0.2) 100%)'
			},
			boxShadow: {
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.07)',
				'glass-lg': '0 12px 42px rgba(0, 0, 0, 0.15)',
				'neon-purple': '0 0 10px rgba(155, 48, 255, 0.5)',
				'neon-purple-lg': '0 0 20px rgba(155, 48, 255, 0.7)',
				'neon-blue': '0 0 10px rgba(59, 130, 246, 0.5)',
				'neon-blue-lg': '0 0 20px rgba(59, 130, 246, 0.7)',
				'neon-green': '0 0 10px rgba(34, 197, 94, 0.5)',
				'neon-green-lg': '0 0 20px rgba(34, 197, 94, 0.7)',
				'neon-red': '0 0 10px rgba(239, 68, 68, 0.5)',
				'neon-red-lg': '0 0 20px rgba(239, 68, 68, 0.7)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
