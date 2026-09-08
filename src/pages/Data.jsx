import "./Data.css";

function Data() {
  return (
    <div className="data-page">
      <div className="data-card">
        <h1>Buy Data</h1>
        <p>Get affordable data bundles for your network.</p>

        <form>
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="08012345678"
          />

          <label>Network</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Network
            </option>
            <option>MTN</option>
            <option>Airtel</option>
            <option>Glo</option>
            <option>9mobile</option>
          </select>

          <label>Data Plan</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Data Plan
            </option>
            <option>500MB - ₦150</option>
            <option>1GB - ₦300</option>
            <option>2GB - ₦600</option>
            <option>5GB - ₦1,500</option>
            <option>10GB - ₦3,000</option>
          </select>

          <button type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Data;