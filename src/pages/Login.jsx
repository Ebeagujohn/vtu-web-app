import "./Login.css";

function Login() {
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          NOHA<span>Hub</span>
        </div>

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to access your NOHA Hub account
        </p>

        <form>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>

        <p className="register-text">
          Don't have an account?{" "}
          <a href="#">Create an account</a>
        </p>

      </div>
    </div>
  );
}

export default Login;