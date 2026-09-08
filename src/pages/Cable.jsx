import "./Cable.css";

function Cable() {
  return (
    <div className="cable-page">
      <div className="cable-card">
        <h1>TV Subscription</h1>
        <p>Renew your favourite TV subscription easily.</p>

        <form>
          <label>TV Provider</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Provider
            </option>
            <option>DStv</option>
            <option>GOtv</option>
            <option>Startimes</option>
          </select>

          <label>Smartcard / IUC Number</label>
          <input
            type="text"
            placeholder="Enter Smartcard or IUC number"
          />

          <label>Subscription Plan</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Plan
            </option>
            <option>Basic - ₦1,500</option>
            <option>Standard - ₦4,000</option>
            <option>Premium - ₦8,000</option>
            <option>Family - ₦12,000</option>
          </select>

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="08012345678"
          />

          <button type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cable;