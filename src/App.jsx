
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import Airtime from "./pages/Airtime";
import Data from "./pages/Data";
import Electricity from "./pages/Electricity";
import Cable from "./pages/Cable";

function Home() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          NOHA<span>Hub</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
  Login
</Link>
          <Link to="/register" className="register-btn">
  Get Started
</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="welcome">FAST • SECURE • RELIABLE</p>

          <h1>
            Your Everyday
            <span> Digital Services</span>
          </h1>

          <p className="hero-text">
            Buy airtime, data, pay electricity bills and subscribe to
            your favourite TV services — all from one simple platform.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Explore Services</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-top">
            <span>Wallet Balance</span>
            <span>•••</span>
          </div>

          <h2>₦25,000.00</h2>

          <p>Available Balance</p>

          <button>+ Fund Wallet</button>
        </div>
      </section>

      {/* Services */}
      <section className="services" id="services">
        <div className="section-heading">
          <p>OUR SERVICES</p>
          <h2>Everything You Need</h2>
          <span>
            Access your essential digital services in one place.
          </span>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon">📱</div>
            <h3>Airtime</h3>
            <p>Recharge any Nigerian network instantly.</p>
            <a href="#">Buy Airtime →</a>
          </div>

          <div className="service-card">
            <div className="service-icon">🌐</div>
            <h3>Data</h3>
            <p>Get affordable data bundles for all networks.</p>
            <a href="#">Buy Data →</a>
          </div>

          <div className="service-card">
            <div className="service-icon">💡</div>
            <h3>Electricity</h3>
            <p>Pay your electricity bills quickly and securely.</p>
            <a href="#">Pay Bill →</a>
          </div>

          <div className="service-card">
            <div className="service-icon">📺</div>
            <h3>Cable TV</h3>
            <p>Renew your DSTV, GOtv and Startimes subscriptions.</p>
            <a href="#">Subscribe →</a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about" id="about">
        <div>
          <p className="section-label">WHY NOHA HUB?</p>
          <h2>Simple. Fast. Reliable.</h2>
        </div>

        <p>
          NOHA Hub is designed to make everyday digital payments
          easier. Our goal is to give users a secure and convenient
          platform for airtime, data, bills and other services.
        </p>
      </section>
        
        {/* Services */}
<section className="services" id="services">
  <div className="section-header">
    <p className="section-tag">OUR SERVICES</p>
    <h2>Everything You Need in One Place</h2>
    <p>
      Fast, secure and convenient digital services for your everyday needs.
    </p>
  </div>

  <div className="services-grid">
    <div className="service-card">
      <div className="service-icon">📱</div>
      <h3>Buy Airtime</h3>
      <p>Recharge your mobile line instantly.</p>
      <Link to="/airtime" className="service-button">
  Buy Airtime
</Link>
    </div>

    <div className="service-card">
      <div className="service-icon">🌐</div>
      <h3>Buy Data</h3>
      <p>Get affordable data bundles for your network.</p>
      <Link to="/data" className="service-button">
  Buy Data
</Link>
    </div>

    <div className="service-card">
      <div className="service-icon">💡</div>
      <h3>Pay Electricity</h3>
      <p>Pay your electricity bills quickly and easily.</p>
      <Link to="/electricity" className="service-button">
  Pay Bill
</Link>
    </div>

    <div className="service-card">
      <div className="service-icon">📺</div>
      <h3>TV Subscription</h3>
      <p>Renew your favourite TV subscriptions.</p>
      <Link to="/cable" className="service-button">
  Subscribe
</Link>
    </div>
  </div>
</section>

      {/* Call To Action */}
      <section className="cta">
        <h2>Ready to get started?</h2>
        <p>Create your account and enjoy convenient digital services.</p>
        <button>Open an Account</button>
      </section>

      {/* Footer */}
      <footer id="contact">
        <div className="logo">
          NOHA<span>Hub</span>
        </div>

        <p>© 2026 NOHA Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/airtime" element={<Airtime />} />
       <Route path="/data" element={<Data />} />
      <Route path="/electricity" element={<Electricity />} />
      <Route path="/cable" element={<Cable />} />
    </Routes>
  );
}

export default App;