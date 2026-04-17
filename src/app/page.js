// src/app/page.js
import Header from '../components/Header/Header'
import Hero from '../components/Hero/Hero'
import About from '../components/About/About'
import Skills from '../components/Skills/Skills'
import Work from '../components/Work/Work'
import Contact from '../components/Contact/Contact'
import Footer from '../components/Footer/Footer'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Work />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
