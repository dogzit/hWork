"use client";
import { useRouter } from "next/navigation";

export default function HomeworkAddPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient-shift"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-slow top-10 -left-20"></div>
        <div className="absolute w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl animate-float-medium top-1/3 right-10"></div>
        <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-float-fast bottom-20 left-1/4"></div>
        <div className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float-reverse bottom-10 right-1/3"></div>
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
             `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col gap-8 items-center p-8">
        <h1 className="text-6xl font-black text-white mb-4 text-center tracking-tight drop-shadow-2xl animate-fade-in">
          Даалгавар нэмэх
        </h1>

        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => router.push("/timeTable")}
            className="group relative px-8 py-4 text-lg hover:cursor-pointer  font-bold text-white overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 transition-all"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-400 to-blue-500 blur-xl transition-opacity"></div>
            <span className="relative z-10 ">⏰ Хичээлийн хуваарь харах</span>
          </button>

          <button
            onClick={() => router.push("/homeWork")}
            className="group relative px-8 py-4 hover:cursor-pointer  text-lg font-bold text-white overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up animation-delay-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 group-hover:from-pink-500 group-hover:to-orange-500 transition-all"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-pink-400 to-orange-400 blur-xl transition-opacity"></div>
            <span className="relative z-10">📚 Даалгавар харах</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        @keyframes float-medium {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(-40px, 40px) rotate(180deg);
          }
        }

        @keyframes float-fast {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -40px) scale(1.1);
          }
          50% {
            transform: translate(-30px, -20px) scale(0.9);
          }
          75% {
            transform: translate(10px, 30px) scale(1.05);
          }
        }

        @keyframes float-reverse {
          0%,
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
          50% {
            transform: translate(50px, -50px) rotate(0deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 18s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
