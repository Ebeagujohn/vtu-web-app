import "./Airtime.css";

function Airtime() {
  return (
    <div className="airtime-page">
      <div className="airtime-card">
        <h1>Buy Airtime</h1>
        <p>Recharge your mobile line instantly.</p>

        <form>
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="08012345678"
          />

          <label>Network</label>
          <select>
            <option>Select Network</option>
            <option>MTN</option>
            <option>Airtel</option>
            <option>Glo</option>
            <option>9mobile</option>
          </select>

          <label>Amount</label>
          <input
            type="number"
            placeholder="₦500"
          />

          <button type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Airtime;