"use client";
import { useRouter } from "next/navigation";

export default function HomeworkAddPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Smooth radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-800/50 via-transparent to-cyan-800/50"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,60,200,0.4),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(200,60,120,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,120,200,0.2),transparent_60%)]"></div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-slow top-10 -left-20"></div>
        <div className="absolute w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl animate-float-medium top-1/3 right-10"></div>
        <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-float-fast bottom-20 left-1/4"></div>
        <div className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float-reverse bottom-10 right-1/3"></div>
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
             `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        <h1 className="text-center text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-2xl animate-bounce">
          Welcome 11д
        </h1>

        <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => router.push("/timeTable")}
            className="group relative overflow-hidden hover:cursor-pointer animate-fade-in rounded-3xl p-6 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 transition-all group-hover:brightness-110" />
            <span className="absolute -inset-24 rounded-full bg-white/20 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-start justify-between gap-4">
              <span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  ⏰
                </span>
                <span className="mt-4 block text-xl font-extrabold">
                  Хичээлийн хуваарь
                </span>
                <span className="mt-1 block text-sm text-white/85">
                  Өнөөдрийн цагуудыг харах
                </span>
              </span>
              <span className="mt-1 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/25 transition group-hover:bg-white/20">
                Нээх
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/homeWork")}
            className="group relative overflow-hidden hover:cursor-pointer animate-fade-in rounded-3xl p-6 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-600 to-orange-500 transition-all group-hover:brightness-110" />
            <span className="absolute -inset-24 rounded-full bg-white/20 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-start justify-between gap-4">
              <span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  📚
                </span>
                <span className="mt-4 block text-xl font-extrabold">
                  Даалгавар
                </span>
                <span className="mt-1 block text-sm text-white/85">
                  Шинэ даалгавраа шалгах
                </span>
              </span>
              <span className="mt-1 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/25 transition group-hover:bg-white/20">
                Нээх
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/duty")}
            className="group relative overflow-hidden hover:cursor-pointer animate-fade-in rounded-3xl p-6 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 transition-all group-hover:brightness-110" />
            <span className="absolute -inset-24 rounded-full bg-white/20 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-start justify-between gap-4">
              <span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  🧹
                </span>
                <span className="mt-4 block text-xl font-extrabold">
                  ЖИЖҮҮР
                </span>
                <span className="mt-1 block text-sm text-white/85">
                  Ээлжийн хуваарь харах
                </span>
              </span>
              <span className="mt-1 rounded-2xl  bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/25 transition group-hover:bg-white/20">
                Нээх
              </span>
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
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
