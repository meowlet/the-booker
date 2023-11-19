/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
	  extend: {
		fontFamily: {
		  "be-vn": ['"Be Vietnam Pro"'],
		},
	  },
	  container: {
		center: true,
		padding: {
		  DEFAULT: "20px",
		  md: "50px",
		},
	  },
	},
	plugins: [],
  };
  