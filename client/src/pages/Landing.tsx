import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
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
            <div className="bg-gradient-to-br from-indigo-500 via-pink-500 to-yellow-400 rounded-lg p-1 mb-4">
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
            <div className="p-4 bg-white rounded shadow">Made by: [Your Name]</div>
            <div className="p-4 bg-white rounded shadow">Made by: [Your Friend]</div>
            <div className="p-4 bg-white rounded shadow">Made by: [Contributor]</div>
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
