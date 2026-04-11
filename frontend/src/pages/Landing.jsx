import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import heroKids from '../assets/stud.jpg';
import programsImg from '../assets/programs.png';
import WordSearch from '../components/WordSearch';

import arduinoLogo from '../assets/logo/Arduino_Logo.svg';
import legoLogo from '../assets/logo/LEGO_logo.svg';
import raspberryPiLogo from '../assets/logo/Raspberry Pi.svg';
import scratchLogo from '../assets/logo/Scratchlogo.svg';
import htmlLogo from '../assets/logo/html.svg';
import pythonLogo from '../assets/logo/python.svg';

import { DirhamIcon } from '../components/GlobalAssets';


// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useCounter(target, duration = 1800, suffix = '') {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numTarget = parseInt(target.replace(/\D/g, ''), 10);
        const step = numTarget / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= numTarget) { setCount(numTarget); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display: `${count}${suffix}` };
}

// ─── FAQ Item ────────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [offerForm, setOfferForm] = useState({
    parentName: '',
    contact: '',
    email: '',
    studentName: '',
    studentClass: ''
  });

  // Nav Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Offer Popup timer
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenOffer = sessionStorage.getItem('hasSeenOffer');
      if (!hasSeenOffer) {
        setShowOfferPopup(true);
        sessionStorage.setItem('hasSeenOffer', 'true');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { parentName, contact, email, studentName, studentClass } = offerForm;

    const scriptURL = 'https://script.google.com/macros/s/AKfycbxC1c5hVvS9pKCiRyxlV3t54tJUVU6tmakJBegdk9oVy2yro9V71YVuBxqg1KjF6ffitA/exec';

    // Use URLSearchParams for POST (best for GAS compatibility with e.parameter)
    const params = new URLSearchParams();
    params.append('parentName', parentName);
    params.append('contact', contact);
    params.append('email', email);
    params.append('studentName', studentName);
    params.append('studentClass', studentClass);

    try {
      await fetch(scriptURL, {
        method: 'POST',
        body: params,
        mode: 'no-cors' // Required for Google Apps Script
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counters
  const c1 = useCounter('10', 1500, '+');
  const c2 = useCounter('15', 1500, '+');
  const c3 = useCounter('500', 1800, '+');



  const testimonials = [
    { name: 'Rashmi Chauhan', role: 'Parent of Khyaati', text: 'My daughter is enjoying her robotics class. One thing I like most is that they focus on practical learning along with the theory portion. She is able to visualize everything she is learning. The teachers are very supportive.' },
    { name: 'Rashmi Karkera', role: 'Parent', text: 'My Son enjoys coming for his Robotics classes every week. He always shares with us what he did in class and tries to apply what he learnt in lessons in daily life. The instructors are amazing.' },
    { name: 'Halima Sadiya', role: 'Level 5 Student', text: 'I’ve had a great experience at Otomatiks Training Center. I’m currently in Level 5 robotics, and the teachers and staff are very supportive and encouraging. The hands-on learning makes the classes enjoyable.' },
    { name: 'Najla Salahuddin', role: 'Parent of Zidan', text: 'My son absolutely loves his robotics classes at Otomatiks! Since moving from India, this has been a place where he’s not only developed a strong interest in robotics but also found a space to be himself and make new friends.' },
    { name: 'Tarun Malik', role: 'Parent', text: 'My son loves Otomatiks robotics classes. He likes to get the basics taught with real-time examples and experiments. Otomatiks standouts due to the fact they teach robotics from base and answer lot of why\'s very well.' },
    { name: 'Joshini Reddy', role: 'Parent', text: 'Otomatiks is the best place if you want your kids to learn the niche skills in today\'s competitive world. They have a well structured curriculum and well trained instructors.' },
    { name: 'Rinky Singhania', role: 'Parent', text: 'Enrolled my daughter and very happy with overall experience. The trainers and management take real efforts to engage the kid and take the parents through the process end to end.' },
    { name: 'Anil Noairs', role: 'Local Guide', text: 'Impressed with what Otomatiks have achieved so far in its short tenure. Iam sure the kids are much enriched in their pursuit of Robotics and STEM knowledge. Dubai is truly blessed to have you.' },
    { name: 'Ruba Hmeedat', role: 'Parent', text: 'I’m a grateful for the time my son spent to learn in Otomatiks Training center. He improves his skills. The team is very kind, the place is very nice.' },
    { name: 'Preeti Aswani', role: 'Parent of Aryan', text: 'Really fun class. I rate it 15,000 stars. Aryan loves it!' }
  ];

  const [currentIndex, setCurrentIndex] = useState(testimonials.length * 25); // Start in the middle of 50 sets

  // Auto-slide testimonials infinitely
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(p => p + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Generate a large array to simulate an infinite loop effortlessly
  const repeatedTestimonials = Array(50).fill(testimonials).flat();

  const faqs = [
    { q: 'What age groups do you cater to?', a: 'We welcome students from age 5 to 17. Programs are carefully grouped by age and skill level for the best learning experience.' },
    { q: 'Do kids need prior coding or robotics experience?', a: 'No prior experience is needed! Our beginner programs start from the very basics, making it approachable for any child.' },
    { q: 'How many students are in each batch?', a: 'We keep batches small — a maximum of 8 students per trainer — ensuring personalized attention and quality learning.' },
    { q: 'Where are your classes held?', a: 'Classes are held at our physical lab in Dubai. We provide all necessary equipment. Parents can observe classes anytime.' },
    { q: 'Can I get a free trial before enrolling?', a: 'Absolutely! We offer a free one-session trial for every new student. Reach out on WhatsApp or click the CTA below to schedule.' },
  ];

  const timeline = [
    {
      age: 'Ages 5–8',
      kit: 'LEGO WeDo 2.0',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
      color: '#ff8a65',
      desc: 'Basics of mechanics, gears & sensors with fun drag-and-drop controls.'
    },
    {
      age: 'Ages 9–12',
      kit: 'Scratch Coding',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
      color: '#42a5f5',
      desc: 'Block-based game dev and interactive stories with real programming logic.'
    },
    {
      age: 'Ages 10–13',
      kit: 'LEGO Mindstorms',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>,
      color: '#66bb6a',
      desc: 'Advanced robotics with colour, ultrasonic sensors and Python.'
    },
    {
      age: 'Ages 13+',
      kit: 'Arduino AI',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
      color: '#f0c419',
      desc: 'Electronics, C++ and machine-learning concepts on real hardware.'
    },
  ];

  const partnerLogos = [
    { name: 'LEGO', src: legoLogo },
    { name: 'Scratch', src: scratchLogo },
    { name: 'Arduino', src: arduinoLogo },
    { name: 'Raspberry Pi', src: raspberryPiLogo },
    { name: 'Python', src: pythonLogo },
    { name: 'HTML', src: htmlLogo }
  ];

  return (
    <div className="landing-wrapper">
      <nav className={`landing-nav ${menuOpen ? 'menu-is-open' : ''} ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-container">
          <div className="landing-logo-text">
            <img src={logo} alt="Otomatiks" style={{ height: '40px', verticalAlign: 'middle', marginRight: '10px' }} />
          </div>

          <div className={`landing-nav-links ${menuOpen ? 'active' : ''}`}>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#programs" onClick={() => setMenuOpen(false)}>Programs</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="landing-btn-secondary mobile-only-hidden" onClick={() => navigate('/login')}>Institute Portal</button>
          </div>

          <div className="landing-nav-mobile-actions">
            <button className="landing-btn-secondary" onClick={() => navigate('/login')}>Portal</button>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="landing-hero reveal">
        <div className="landing-container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-label">JOIN US</span>
              <h1 className="hero-title">Robotics for <br />Your Kids<span className="dot">.</span></h1>
              <p className="hero-subtitle">
                We provide a comprehensive robotics education that fosters creativity,
                problem-solving, and critical thinking skills in children of all ages.
              </p>
              <div className="hero-actions">
                <a href="#programs" className="landing-btn-primary">Our Classes</a>
                <a href="#faq" className="landing-btn-outline">Learn More</a>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <img src={heroKids} alt="Kids with sensors" />
            </div>
          </div>
        </div>
      </header>

      {/* ── 8. Logo / Partner Trust Bar ── */}
      <div className="trust-bar reveal">
        <div className="landing-container">
          <p className="trust-label">Curriculum powered by world-class tools</p>
          <div className="trust-logos-marquee">
            <div className="trust-logos-track">
              {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((l, i) => (
                <img src={l.src} alt={l.name} className="trust-logo-img" key={i} title={l.name} />
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* ── Features ── */}
      <section className="landing-section reveal" id="about" style={{ paddingTop: '40px' }}>
        <div className="landing-container">
          <span className="section-label">WHAT WE DO</span>
          <h2 className="section-title">At a Glance<span className="dot">.</span></h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </span>
              <h3 className="feature-title">Experience</h3>
              <p className="muted">Hands-on learning with world-class robotics kits and expert mentors.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9" /><path d="M17.64 15 22 10.64" /><path d="m20.9 2.33 2.33 2.33-5.24 5.24-2.33-2.33z" /></svg>
              </span>
              <h3 className="feature-title">Practice</h3>
              <p className="muted">Learning by doing. Building real models that solve real-world problems.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
              </span>
              <h3 className="feature-title">Skills</h3>
              <p className="muted">Developing 21st-century skills: Coding, Logic, and Engineering.</p>
            </div>
          </div>

          <div className="fun-zone reveal" style={{ marginTop: '60px', textAlign: 'center' }}>
            <span className="section-label" style={{ color: 'var(--accent-pink)', background: 'linear-gradient(90deg, rgba(255,64,129,0) 0%, rgba(255,64,129,0.15) 25%, rgba(255,64,129,0.15) 75%, rgba(255,64,129,0) 100%)', margin: '0 auto 15px', padding: '6px 0' }}>FUN LEARNING ZONE</span>
            <h2 className="section-title" style={{ fontSize: '32px' }}>Robotics Word Search<span className="dot" style={{ color: 'var(--accent-pink)' }}>.</span></h2>
            <p className="muted" style={{ maxWidth: '600px', marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto' }}>Can you find all the hidden robotics terms? Click the letters to select a word!</p>
            <WordSearch />
          </div>
        </div>
      </section>

      {/* ── 6. Course Timeline ── */}
      <section className="landing-section reveal">
        <div className="landing-container">
          <span className="section-label">LEARNING PATH</span>
          <h2 className="section-title">Your Child's Journey<span className="dot">.</span></h2>
          <div className="timeline-track">
            {timeline.map((t, i) => (
              <div className="timeline-step" key={i}>
                <div className="timeline-icon" style={{ background: t.color }}>{t.icon}</div>
                <div className="timeline-connector" style={{ background: i < timeline.length - 1 ? t.color : 'transparent' }}></div>
                <div className="timeline-card">
                  <span className="program-tag" style={{ color: t.color }}>{t.age}</span>
                  <h3 className="feature-title" style={{ fontSize: '20px', margin: '8px 0' }}>{t.kit}</h3>
                  <p className="small muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="landing-section reveal" id="programs">
        <div className="landing-container">
          <span className="section-label">OUR PROGRAMS</span>
          <h2 className="section-title">Explore Robotics<span className="dot">.</span></h2>
          <div className="program-grid">
            {[
              { img: programsImg, tag: 'AGES 5-8', name: 'LEGO WEDO 2.0', desc: 'Introduction to basic mechanics and simple visual programming.' },
              { img: programsImg, tag: 'AGES 9-12', name: 'Scratch Coding', desc: 'Game development and interactive storytelling with block coding.' },
              { img: programsImg, tag: 'AGES 10+', name: 'LEGO Mindstorms', desc: 'Advanced robotics with complex sensors and python integration.' },
              { img: programsImg, tag: 'AGES 13+', name: 'Arduino AI', desc: 'Electronics, C++ programming, and AI-powered autonomous robots.' },
            ].map((p, i) => (
              <div className="program-card" key={i}>
                <img src={p.img} className="program-img" alt={p.name} />
                <div className="program-content">
                  <span className="program-tag">{p.tag}</span>
                  <h3 className="feature-title">{p.name}</h3>
                  <p className="small muted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology + 1. Animated Counters ── */}
      <section className="landing-section reveal">
        <div className="method-section-outer">
          <div className="method-section">
            <div className="landing-container">
              <div className="method-grid">
                <div className="method-content">
                  <span className="hero-label" style={{ color: 'var(--accent2)', background: 'rgba(240, 196, 25, 0.1)' }}>METHODOLOGY</span>
                  <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '32px' }}>How We Teach<span className="dot" style={{ color: 'var(--accent2)' }}>.</span></h2>
                  <ul className="method-list">
                    <li>Personalized learning paths for every student</li>
                    <li>Project-based curriculum with real goals</li>
                    <li>Small groups of max 8 students per trainer</li>
                    <li>Regular progress tracking &amp; parent feedback</li>
                  </ul>
                </div>
                <div className="method-stats">
                  <div className="stat-card-glow" ref={c1.ref}>
                    <div className="stat-val">{c1.display}</div>
                    <div className="stat-desc">Courses</div>
                  </div>
                  <div className="stat-card-glow" ref={c2.ref}>
                    <div className="stat-val">{c2.display}</div>
                    <div className="stat-desc">Years</div>
                  </div>
                  <div className="stat-card-glow" ref={c3.ref}>
                    <div className="stat-val">{c3.display}</div>
                    <div className="stat-desc">Students</div>
                  </div>
                  <div className="stat-card-glow">
                    <div className="stat-val">24/7</div>
                    <div className="stat-desc">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section reveal" id="testimonials">
        <div className="landing-container">
          <span className="section-label">WHAT PARENTS SAY</span>
          <h2 className="section-title">Real Stories<span className="dot">.</span></h2>
          <div className="testimonials-wrap-outer" style={{ '--active-index': currentIndex }}>
            <div className="testimonials-track">
              {repeatedTestimonials.map((t, i) => {
                const isActive = i === currentIndex;
                return (
                  <div
                    className={`testimonial-card-v2 ${isActive ? 'active' : ''}`}
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <div className="testimonial-stars">★★★★★</div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{t.name[0]}</div>
                      <div>
                        <div className="testimonial-name">{t.name}</div>
                        <div className="testimonial-role muted small">{t.role}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="testimonial-dots">
              {testimonials.map((_, i) => {
                const isDotActive = i === currentIndex % testimonials.length;
                return (
                  <span
                    key={i}
                    className={`test-dot ${isDotActive ? 'active' : ''}`}
                    onClick={() => {
                      const currentMod = currentIndex % testimonials.length;
                      let diff = i - currentMod;
                      // Jump in the shortest direction
                      if (diff > testimonials.length / 2) diff -= testimonials.length;
                      if (diff < -testimonials.length / 2) diff += testimonials.length;
                      setCurrentIndex(currentIndex + diff);
                    }}
                  ></span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="landing-section reveal" id="pricing">
        <div className="landing-container">
          <span className="section-label">PRICING</span>
          <h2 className="section-title">Our Pricing<span className="dot">.</span></h2>
          <div className="pricing-grid">
            <div className="price-card">
              <h3 className="feature-title">Bootcamp</h3>
              <div className="price-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DirhamIcon size={46} style={{ marginRight: '6px' }} />
                30 <span>/ Trail Session</span>
              </div>
              <p className="small muted">On All Saturdays</p>
              <button className="landing-btn-outline" onClick={() => window.open('https://wa.me/971528834358', '_blank')} style={{ marginTop: '30px', width: '100%' }}>Enroll Now</button>
              <p style={{ position: 'absolute', bottom: '24px', left: '0', width: '100%', textAlign: 'center', fontSize: '11px', color: '#000', fontWeight: '700' }}>*T & C Apply</p>
            </div>
            <div className="price-card popular">
              <h3 className="feature-title">Level Wise</h3>
              <div className="price-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DirhamIcon size={46} style={{ marginRight: '6px' }} />
                3500 <span>/ Level</span>
              </div>
              <p className="small muted">2 Sessions per week</p>
              <button className="landing-btn-primary" onClick={() => window.open('https://wa.me/971528834358', '_blank')} style={{ marginTop: '30px', width: '100%', background: '#000', color: '#fff' }}>Enroll Now</button>
              <p style={{ position: 'absolute', bottom: '24px', left: '0', width: '100%', textAlign: 'center', fontSize: '11px', color: '#000', fontWeight: '700' }}>*T & C Apply</p>
            </div>
            <div className="price-card">
              <h3 className="feature-title">Professional</h3>
              <div className="price-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DirhamIcon size={46} style={{ marginRight: '6px' }} />
                14000<span></span>
              </div>
              <p className="small muted">6 Levels - Complete Course</p>
              <button className="landing-btn-outline" onClick={() => window.open('https://wa.me/971528834358', '_blank')} style={{ marginTop: '30px', width: '100%' }}>Enroll Now</button>
              <p style={{ position: 'absolute', bottom: '24px', left: '0', width: '100%', textAlign: 'center', fontSize: '11px', color: '#000', fontWeight: '700' }}>*T & C Apply</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FAQ Accordion ── */}
      <section className="landing-section reveal" id="faq">
        <div className="landing-container" style={{ maxWidth: '800px' }}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Common Questions<span className="dot">.</span></h2>
          <div className="faq-list">
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Register CTA ── */}
      <section className="landing-container reveal">
        <div className="cta-banner" style={{ position: 'relative', overflow: 'hidden', maxWidth: '800px', margin: '0 auto' }}>
          <span className="section-label" style={{ color: '#000' }}>GET IN TOUCH</span>
          <h2 style={{ fontSize: '48px' }}>Sign Up Now for just <br /><span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><DirhamIcon size={42} /> 30</span> for a trial lesson<span style={{ color: '#1a56b2' }}>.</span></h2>
          <button className="landing-btn-primary" onClick={() => window.open('https://wa.me/971528834358', '_blank')} style={{ background: '#000', color: '#fff', marginTop: '20px' }}>Join Otomatiks Today</button>
          <p style={{ position: 'absolute', bottom: '16px', left: '0', width: '100%', textAlign: 'center', fontSize: '11px', color: 'rgba(0,0,0,0.4)', fontWeight: '700' }}>*T & C Apply</p>
        </div>
      </section>

      {/* ── Location & Map Section ── */}
      <section className="landing-section reveal" id="location" style={{ padding: '60px 0' }}>
        <div className="landing-container">
          <span className="section-label">FIND US</span>
          <h2 className="section-title">Our Location<span className="dot">.</span></h2>
          <div className="location-grid">

            {/* Info Panel */}
            <div className="location-info-card">
              <h3 className="location-name">Otomatiks Training Centre</h3>
              <span className="location-badge">JLT | Burjuman | Al Nahda - Dubai</span>

              <div className="location-details">
                <div className="location-detail-row">
                  <svg className="loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div>
                    <div className="location-detail-label">Address</div>
                    <div className="location-detail-value">No.608, Fortune Executive Tower, Cluster T<br />Jumeirah Lakes Towers, Dubai</div>
                  </div>
                </div>

                <div className="location-detail-row">
                  <svg className="loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                  <div>
                    <div className="location-detail-label">Phone / WhatsApp</div>
                    <div className="location-detail-value">
                      <a href="https://wa.me/971528834358" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: '700' }}>+971 52 883 4358</a>
                    </div>
                  </div>
                </div>

                <div className="location-detail-row">
                  <svg className="loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <div>
                    <div className="location-detail-label">Working Hours</div>
                    <div className="location-detail-value">Mon – Sun: 10:00 AM – 7:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="location-map-wrapper">
              <iframe
                title="Otomatiks Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.2!2d55.1491058!3d25.078944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6dc7f1716d63%3A0x6e741052a7d2d97b!2sOtomatiks%20Training%20Centre%20DMCC!5e0!3m2!1sen!2sae!4v1710000000000!5m2!1sen!2sae"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p className="small muted" style={{ textAlign: 'center' }}>&copy; 2026 Otomatiks. All rights reserved.</p>
        </div>
      </footer>

      {/* ── 7. Floating Liquid Glass Trial Pill ── */}
      <div className="sticky-cta-bar">
        <div className="liquid-glass-pill">
          <span className="liquid-pulse-dot"></span>
          <span className="liquid-cta-text">
            <strong>Limited Offer!</strong> Book a <strong>Demo Session</strong> Today
          </span>
          <button className="liquid-cta-btn" onClick={() => navigate('/login')}>
            Reserve My Spot ✦
          </button>
        </div>
      </div>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/971528834358"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <svg className="whatsapp-icon" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 69.4 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>

      {/* ── 30% Offer Popup ── */}
      {showOfferPopup && (
        <div className="offer-overlay">
          <div className="offer-modal reveal-visible">
            <button className="offer-close" onClick={() => setShowOfferPopup(false)}>&times;</button>
            <div className="offer-content">
              <div className="offer-badge">LIMITED TIME OFFER</div>
              <h2 className="offer-title">Grab <span>30% OFF</span></h2>
              <p className="offer-subtitle">Enroll now for Robotics classes and give your kids the future they deserve!</p>

              {isSubmitted ? (
                <div className="offer-success-state">
                  <div className="success-icon-badge">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 className="offer-title" style={{ fontSize: '28px', marginTop: '20px' }}>Offer <span>Grabbed!</span></h3>
                  <p className="offer-subtitle">Excellent choice! We have received your details and our team will contact you via WhatsApp shortly to finalize your 30% discount.</p>
                  <button className="offer-submit-btn" style={{ width: '100%' }} onClick={() => setShowOfferPopup(false)}>
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOfferSubmit} className="offer-form">
                  <input
                    type="text"
                    placeholder="Parent Name"
                    required
                    value={offerForm.parentName}
                    onChange={(e) => setOfferForm({ ...offerForm, parentName: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    required
                    value={offerForm.contact}
                    onChange={(e) => setOfferForm({ ...offerForm, contact: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email ID"
                    required
                    value={offerForm.email}
                    onChange={(e) => setOfferForm({ ...offerForm, email: e.target.value })}
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Student Name"
                      required
                      value={offerForm.studentName}
                      onChange={(e) => setOfferForm({ ...offerForm, studentName: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Grade/Class"
                      required
                      value={offerForm.studentClass}
                      onChange={(e) => setOfferForm({ ...offerForm, studentClass: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="offer-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Claim My 30% Discount'}
                    {!isSubmitting && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '10px' }}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>}
                  </button>
                </form>
              )}
              {!isSubmitted && <p className="offer-footer">We'll contact you via WhatsApp to finalize your discount!</p>}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .success-icon-badge {
          width: 80px; height: 80px;
          background: rgba(61, 220, 151, 0.1);
          color: #3ddc97;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          animation: success-pulse 2s infinite;
        }
        @keyframes success-pulse {
          0% { box-shadow: 0 0 0 0 rgba(61, 220, 151, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(61, 220, 151, 0); }
          100% { box-shadow: 0 0 0 0 rgba(61, 220, 151, 0); }
        }
        .offer-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .offer-modal {
          background: #fff;
          width: 100%;
          max-width: 500px;
          border-radius: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modal-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .offer-close {
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(0,0,0,0.05);
          border: none;
          width: 36px; height: 36px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .offer-close:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); }
        .offer-content { padding: 40px; text-align: center; }
        .offer-badge {
          display: inline-block;
          background: rgba(255, 64, 129, 0.1);
          color: var(--accent-pink);
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .offer-title { font-size: 36px; font-weight: 800; color: var(--accent); margin-bottom: 12px; }
        .offer-title span { color: var(--accent2); }
        .offer-subtitle { color: var(--muted); font-size: 16px; margin-bottom: 30px; line-height: 1.5; }
        
        .offer-form { display: flex; flex-direction: column; gap: 12px; }
        .offer-form input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          font-size: 15px;
          transition: all 0.2s;
        }
        .offer-form input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 4px rgba(26, 86, 178, 0.1); }
        .form-row { display: flex; gap: 12px; }
        .offer-submit-btn {
          margin-top: 10px;
          background: var(--accent);
          color: #fff;
          padding: 16px;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(26, 86, 178, 0.3);
        }
        .offer-submit-btn:hover { background: #1e6dcf; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(26, 86, 178, 0.4); }
        .offer-footer { font-size: 12px; color: var(--muted); margin-top: 20px; }
        
        @media (max-width: 480px) {
          .offer-content { padding: 30px 20px; }
          .offer-title { font-size: 28px; }
          .form-row { flex-direction: column; }
        }
      `}} />
    </div>
  );
}
