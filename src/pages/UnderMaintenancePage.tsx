export default function UnderMaintenancePage() {


return (
<div className="min-h-screen flex items-center justify-center">
    <div className="p-8 bg-white rounded-2xl shadow-md max-w-md w-full">
    <h1 className="text-center text-2xl font-bold text-gray-800 mb-3">We'll be back soon!</h1>
    <p className="text-gray-600 mb-6">
      Our site is currently undergoing maintenance. Please check back later.
    </p>
    <div className="flex justify-center mb-6">
      <svg
        className="animate-spin h-8 w-8 text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>

  </div>
</div>
);
}