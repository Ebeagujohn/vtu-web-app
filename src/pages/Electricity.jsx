import "./Electricity.css";

function Electricity() {
  return (
    <div className="electricity-page">
      <div className="electricity-card">
        <h1>Pay Electricity Bill</h1>
        <p>Pay your electricity bill quickly and securely.</p>

        <form>
          <label>Electricity Provider</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Provider
            </option>
            <option>IKEDC</option>
            <option>EKEDC</option>
            <option>IBEDC</option>
            <option>JED</option>
            <option>KEDCO</option>
            <option>PHED</option>
            <option>KAEDCO</option>
            <option>ABUJA DISCO</option>
          </select>

          <label>Meter Type</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Meter Type
            </option>
            <option>Prepaid</option>
            <option>Postpaid</option>
          </select>

          <label>Meter Number</label>
          <input
            type="text"
            placeholder="Enter meter number"
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="08012345678"
          />

          <label>Amount</label>
          <input
            type="number"
            placeholder="₦5,000"
          />

          <button type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Electricity;