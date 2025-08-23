import { useState } from "react";

// Define the available rewards.
// You can easily add, remove, or change rewards here.
const rewards = [
  {
    name: "Free Coffee",
    pointsNeeded: 500,
    message: "Enjoy your free coffee!",
  },
  {
    name: "Free Main Course (Please inform th cashier what you'd want.)",
    pointsNeeded: 300,
    message: "Enjoy your free pastry!",
  },
  {
    name: "30% Off",
    pointsNeeded: 1000,
    message: "Your 20% discount has been applied!",
  },
  {
    name: "Free Cookies",
    pointsNeeded: 200,
    message: "Enjoy your free cookies!",
  },
];

const App = () => {
  // State for the card number input
  const [cardNumber, setCardNumber] = useState("");
  // State for the PIN input
  const [pin, setPin] = useState("");
  // State for the points balance to be displayed
  const [balance, setBalance] = useState(null);
  // State for showing a loading message
  const [loading, setLoading] = useState(false);
  // State for showing a redemption loading message
  const [redeeming, setRedeeming] = useState(false);
  // State for showing error messages
  const [error, setError] = useState("");
  // State for the success message
  const [successMessage, setSuccessMessage] = useState("");

  // This is the URL from your deployed Google Apps Script.
  // REPLACE this with the URL you got from deploying the script.
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzLE7GKG0lhXuLI-BQ1h5Oz4jvQMwsm7m77q7ylppsCExd4c68rJfm3EYNdEvMlwAbR/exec";

  /**
   * Handles the balance check when the button is clicked (GET request).
   */
  const handleCheckBalance = async () => {
    // Clear previous results and show loading state
    setBalance(null);
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // Build the URL with the card number and PIN as query parameters
      const url = `${SCRIPT_URL}?card=${encodeURIComponent(
        cardNumber
      )}&pin=${encodeURIComponent(pin)}`;

      // Fetch the data from your Google Apps Script
      const response = await fetch(url);
      const data = await response.json();

      if (data.points !== null) {
        setBalance(data.points);
        setError("");
        setSuccessMessage("Login successful! Welcome.");
      } else {
        setError(data.message); // Display the specific error message from the script
        setBalance(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred. Please try again later.");
      setBalance(null);
    } finally {
      // Hide loading state
      setLoading(false);
    }
  };

  /**
   * Handles the point redemption process (POST request) for a specific reward.
   * @param {number} pointsToRedeem - The number of points to deduct.
   * @param {string} redemptionMessage - A custom message to show upon success.
   */
  const handleRedeemReward = async (pointsToRedeem, redemptionMessage) => {
    setRedeeming(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card: cardNumber,
          pin: pin,
          points: parseFloat(pointsToRedeem),
        }),
      });

      const data = await response.json();

      if (data.message.includes("successfully")) {
        setSuccessMessage(redemptionMessage);
        // Refresh the balance after successful redemption
        handleCheckBalance();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error redeeming points:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sniglet">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Rewards Balance Checker
        </h1>
        <p className="text-gray-600 mb-6">
          Enter your card number and PIN to check your rewards points balance.
        </p>

        {/* Input fields and button container */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            className="w-full px-4 py-2 text-lg text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCheckBalance();
              }
            }}
          />
          <input
            type="password"
            className="w-full px-4 py-2 text-lg text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCheckBalance();
              }
            }}
          />
          <button
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 transform hover:scale-105"
            onClick={handleCheckBalance}
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Balance"}
          </button>
        </div>

        {/* Display area for results */}
        <div className="min-h-[100px] flex flex-col items-center justify-center">
          {loading ? (
            <p className="text-blue-500 text-lg">Loading...</p>
          ) : balance !== null ? (
            <div className="w-full">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg w-full mb-4">
                <p className="text-lg font-medium">{successMessage}</p>
              </div>
              <div className="bg-green-100 text-green-800 p-4 rounded-lg w-full">
                <p className="text-lg font-medium">Your current balance is:</p>
                <p className="text-5xl font-extrabold mt-2 tracking-wide">
                  {Math.floor(balance).toLocaleString()} Points
                </p>
              </div>

              {/* Redeemable Rewards Section */}
              <div className="mt-8 space-y-4">
                <p className="text-gray-600 font-medium text-center">
                  Your Redeemable Rewards
                </p>
                {rewards.map(
                  (reward, index) =>
                    // Only display the reward if the customer can afford it
                    balance >= reward.pointsNeeded && (
                      <button
                        key={index}
                        className="w-full px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 transform hover:scale-105"
                        onClick={() =>
                          handleRedeemReward(
                            reward.pointsNeeded,
                            reward.message
                          )
                        }
                        disabled={redeeming}
                      >
                        {redeeming
                          ? "Redeeming..."
                          : `${reward.name} (${reward.pointsNeeded} Points)`}
                      </button>
                    )
                )}
                {/* Display a message if no rewards can be redeemed */}
                {rewards.every((reward) => balance < reward.pointsNeeded) && (
                  <p className="text-gray-500 text-sm">
                    Keep collecting points to unlock rewards!
                  </p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg w-full">
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-lg">
              Awaiting your card number and PIN...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
