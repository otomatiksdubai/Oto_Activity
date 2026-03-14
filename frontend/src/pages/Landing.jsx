import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import heroKids from '../assets/stud.jpg';
import programsImg from '../assets/programs.png';

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
  const c1 = useCounter('50', 1500, '+');
  const c2 = useCounter('12', 1500, '+');
  const c3 = useCounter('500', 1800, '+');

  const marqueeItems = [
    '🤖 Robotics', '🧠 AI & Coding', '🛠️ LEGO WeDo', '💡 Arduino', '🎓 Scratch',
    '🏆 Competitions', '🔬 STEM Projects', '🚀 LEGO Mindstorms', '🎮 Game Dev', '💻 Python'
  ];

  const testimonials = [
    { name: 'Sara Al Mansouri', role: 'Parent of Ahmed, 9', text: 'My son came home every day excited. The trainers are patient and incredibly skilled. Best investment we made!' },
    { name: 'James Fernandez', role: 'Parent of Lily, 11', text: 'Lily built her first robot in month 2. The progress is incredible and the small batch size really makes a difference.' },
    { name: 'Fatima Al Rashidi', role: 'Parent of Omar, 7', text: 'I love how they mix screen-free robotics with coding. Omar has become so focused and creative since joining.' },
    { name: 'Raj Patel', role: 'Parent of Arya, 13', text: 'Arya\'s Python skills jumped significantly. The Arduino AI course is genuinely advanced. Highly recommended!' },
  ];

  const faqs = [
    { q: 'What age groups do you cater to?', a: 'We welcome students from age 5 to 17. Programs are carefully grouped by age and skill level for the best learning experience.' },
    { q: 'Do kids need prior coding or robotics experience?', a: 'No prior experience is needed! Our beginner programs start from the very basics, making it approachable for any child.' },
    { q: 'How many students are in each batch?', a: 'We keep batches small — a maximum of 8 students per trainer — ensuring personalized attention and quality learning.' },
    { q: 'Where are your classes held?', a: 'Classes are held at our physical lab in Dubai. We provide all necessary equipment. Parents can observe classes anytime.' },
    { q: 'Can I get a free trial before enrolling?', a: 'Absolutely! We offer a free one-session trial for every new student. Reach out on WhatsApp or click the CTA below to schedule.' },
  ];

  const timeline = [
    { age: 'Ages 5–8', kit: 'LEGO WeDo 2.0', icon: '🧩', color: '#ff8a65', desc: 'Basics of mechanics, gears & sensors with fun drag-and-drop controls.' },
    { age: 'Ages 9–12', kit: 'Scratch Coding', icon: '🎮', color: '#42a5f5', desc: 'Block-based game dev and interactive stories with real programming logic.' },
    { age: 'Ages 10–13', kit: 'LEGO Mindstorms', icon: '🤖', color: '#66bb6a', desc: 'Advanced robotics with colour, ultrasonic sensors and Python.' },
    { age: 'Ages 13+', kit: 'Arduino AI', icon: '⚡', color: '#f0c419', desc: 'Electronics, C++ and machine-learning concepts on real hardware.' },
  ];

  const partnerLogos = ['LEGO Education', 'Scratch MIT', 'Arduino', 'Raspberry Pi', 'Google for Education', 'Microsoft STEM'];

  return (
    <div className="landing-wrapper">
      {/* Background Pattern */}
      <div className="bg-pattern"></div>

      {/* Top Gradient Fade Mask */}
      <div className="nav-fade-mask"></div>

      {/* ── Navigation ── */}
      <nav className={`landing-nav ${menuOpen ? 'menu-is-open' : ''}`}>
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
                <button className="landing-btn-primary" onClick={() => navigate('/login')}>Our Classes</button>
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
          <div className="trust-logos">
            {partnerLogos.map((l, i) => (
              <span className="trust-logo-chip" key={i}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Marquee Ticker ── */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span className="marquee-item" key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* Wave Separator */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 36.7C840 27 960 13 1080 16.7C1200 20 1320 40 1380 50L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#fcfcfc" />
        </svg>
      </div>

      {/* ── Features ── */}
      <section className="landing-section reveal" id="about" style={{ background: '#fcfcfc', paddingTop: '40px' }}>
        <div className="landing-container">
          <span className="section-label">WHAT WE DO</span>
          <h2 className="section-title">At a Glance<span className="dot">.</span></h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3 className="feature-title">Experience</h3>
              <p className="muted">Hands-on learning with world-class robotics kits and expert mentors.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛠️</span>
              <h3 className="feature-title">Practice</h3>
              <p className="muted">Learning by doing. Building real models that solve real-world problems.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🧠</span>
              <h3 className="feature-title">Skills</h3>
              <p className="muted">Developing 21st-century skills: Coding, Logic, and Engineering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Course Timeline ── */}
      <section className="landing-section reveal" style={{ background: '#fcfcfc' }}>
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
      <section className="landing-section reveal" id="programs" style={{ background: '#fcfcfc' }}>
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

      {/* ── 3. Testimonials ── */}
      <section className="landing-section reveal" id="testimonials">
        <div className="landing-container">
          <span className="section-label">WHAT PARENTS SAY</span>
          <h2 className="section-title">Real Stories<span className="dot">.</span></h2>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
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
            ))}
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
              <h3 className="feature-title">Standard</h3>
              <div className="price-val">$120<span>/month</span></div>
              <p className="small muted">1 Session per week</p>
              <button className="landing-btn-outline" style={{ marginTop: '30px', width: '100%' }}>Enroll Now</button>
            </div>
            <div className="price-card popular">
              <h3 className="feature-title">Business</h3>
              <div className="price-val">$150<span>/month</span></div>
              <p className="small muted">2 Sessions per week</p>
              <button className="landing-btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '30px', width: '100%', background: '#000', color: '#fff' }}>Enroll Now</button>
            </div>
            <div className="price-card">
              <h3 className="feature-title">Professional</h3>
              <div className="price-val">$200<span>/month</span></div>
              <p className="small muted">Daily Lab Access</p>
              <button className="landing-btn-outline" style={{ marginTop: '30px', width: '100%' }}>Enroll Now</button>
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
        <div className="cta-banner">
          <span className="section-label" style={{ color: '#000' }}>GET IN TOUCH</span>
          <h2>Sign Up Now for a <br />Free Trial Lesson<span style={{ color: '#1a56b2' }}>.</span></h2>
          <button className="landing-btn-primary" onClick={() => navigate('/login')} style={{ background: '#000', color: '#fff' }}>Join Otomatiks Today</button>
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
              <span className="location-badge">JLT · Dubai</span>

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
            🎓 <strong>Limited Spots!</strong> Book a&nbsp;<strong>FREE Trial</strong>&nbsp;Today
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
    </div>
  );
}
