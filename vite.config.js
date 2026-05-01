import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vinicimdev-PG29Vinicius_CloudComputing_A1/',  // ← coloca o nome exato do repo do site
})