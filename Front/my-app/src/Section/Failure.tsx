import { useNavigate } from "react-router-dom";

function Failure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded shadow text-center w-96">
        <div className="text-red-600 text-5xl mb-4">✖</div>

        <h1 className="text-2xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="text-gray-600 mt-2">
          Transaction was not completed. Please try again.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-5 bg-red-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default Failure;