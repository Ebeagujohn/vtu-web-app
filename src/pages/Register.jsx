import { useState } from "react";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  localStorage.setItem("vtuUser", JSON.stringify(formData));

  alert("Account created successfully!");

  window.location.href = "/login";
};

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-logo">
          NOHA<span>Hub</span>
        </div>

        <h1>Create Your Account</h1>

        <p className="register-subtitle">
          Join NOHA Hub and enjoy fast digital services
        </p>

        <form onSubmit={handleSubmit}>
            <form onSubmit={handleSubmit}></form>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
             name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
             required
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="08012345678"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-submit">
            Create Account
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

      </div>
     </div>
  );
}

export default Register;