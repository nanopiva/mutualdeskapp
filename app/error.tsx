"use client";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: "linear-gradient(to bottom right, #fcfffc, #f0f4f8)",
      }}
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#248232] mb-4">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#040f0f] mb-2">Oops!</h1>
        <h2 className="text-xl text-[#2d3a3a] mb-6">
          Page not found or unauthorized access
        </h2>

        <p className="text-[#2d3a3a] mb-8">
          We're sorry, the page you're looking for doesn't exist or you don't
          have permission to access it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#248232] text-white font-medium rounded-md hover:bg-[#2ba84a] transition-colors duration-200"
          >
            Return to homepage
          </Link>
          <Link
            href="/dashboard/my-projects"
            className="px-6 py-3 border border-[#248232] text-[#248232] font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Browse projects
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-[#2d3a3a]">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-[#248232] hover:text-[#2ba84a] font-medium"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
