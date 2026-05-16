import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-100">
      <Navbar />

      <header className="container mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 animate-fade-up">
            Organize work. Ship faster.
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-8 animate-fade-up delay-150">
            TaskIt helps teams and individuals manage tasks, attachments and timelines with a clean, modern experience.
          </p>

          <div className="flex justify-center lg:justify-start gap-4">
            <Link
              to="/login"
              className="bg-black text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transform transition-transform duration-300 animate-pop"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors duration-300 animate-pop delay-150"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transform hover:-translate-y-2 transition-transform duration-700 animate-tilt">
            <div className="bg-linear-to-br from-indigo-500 via-pink-500 to-yellow-400 rounded-lg p-1 mb-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-800">Project Alpha</h3>
                <p className="text-sm text-gray-500">2 tasks due • 1 high priority</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Design mockups</span>
                    <span className="text-xs text-green-600">IN_PROGRESS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Setup database</span>
                    <span className="text-xs text-gray-500">TODO</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Preview of a minimal task card — smooth UI, responsive.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="grid gap-8 md:grid-cols-3">
          <Feature title="Assign & Track" desc="Assign tasks to team members and track progress in real time." />
          <Feature title="Attachments" desc="Attach files to tasks and download them securely." />
          <Feature title="Notifications" desc="Get timely updates on task changes and deadlines." />
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Made with care</h2>
          <p className="text-gray-600 mb-6">A simple, focused task management experience.</p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-white rounded shadow">Made by: Adarsh Srivastava</div>

            <a
              href="https://github.com/ADARSHsri2004"
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-white rounded shadow flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.68c-2.77.6-3.35-1.17-3.35-1.17-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.88 1.52 2.31 1.08 2.87.83.09-.64.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.48 9.48 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.35 4.68-4.58 4.92.36.31.69.92.69 1.86v2.76c0 .26.17.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/adarsh-srivastava-871793261/"
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-white rounded shadow flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M4.98 3.5A2.5 2.5 0 1 1 2.5 6a2.5 2.5 0 0 1 2.48-2.5ZM3 8.5h4V22H3V8.5Zm7 0h3.84v1.85h.05c.54-1.02 1.88-2.1 3.87-2.1C21.01 8.25 22 10.4 22 13.13V22h-4v-7.55c0-1.8-.03-4.12-2.52-4.12-2.52 0-2.9 1.97-2.9 4V22h-4V8.5Z" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
