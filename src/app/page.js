// src/app/page.js
import Header from '../components/Header/Header'
import Hero from '../components/Hero/Hero'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        {/* sections added here as they are built */}
      </main>
    </div>
  )
}
