"use client";
import { useRouter } from "next/navigation";

export default function HomeworkAddPage() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Хуваарь өөрчлөх",
      description: "Хичээлийн хуваарь засах, шинэчлэх",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:shadow-blue-500/50",
      route: "/admin/timeTable",
    },
    {
      title: "Даалгавар нэмэх",
      description: "Шинэ даалгавар үүсгэх",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
      hoverColor: "hover:shadow-green-500/50",
      route: "/admin/homework/add",
    },
    {
      title: "Даалгавар удирдах",
      description: "Даалгавар өөрчлөх, засах, устгах",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:shadow-purple-500/50",
      route: "/admin/homework",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Толгой хэсэг */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Админ удирдлага
          </h1>
          <p className="text-slate-600 text-lg">
            Хичээлийн хуваарь болон даалгаврын удирдлага
          </p>
        </div>

        {/* Цэс картууд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.route)}
              className={`
                group relative bg-white rounded-2xl shadow-lg border border-slate-200
                transition-all duration-300 cursor-pointer overflow-hidden
                hover:shadow-2xl hover:-translate-y-2 ${item.hoverColor}
              `}
            >
              {/* Gradient толгой */}
              <div className={`bg-gradient-to-br ${item.color} p-6`}>
                <div className="text-white mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
              </div>

              {/* Агуулга */}
              <div className="p-6">
                <p className="text-slate-600 mb-4">{item.description}</p>

                {/* Товч */}
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 group-hover:gap-3 transition-all">
                  <span>Нээх</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Hover эффект */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Статистик хэсэг (optional) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Хуваарь</p>
            <p className="text-2xl font-bold text-slate-900">Удирдах</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Даалгавар</p>
            <p className="text-2xl font-bold text-slate-900">Нэмэх</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-xl mb-4">
              <svg
                className="w-7 h-7 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Даалгавар</p>
            <p className="text-2xl font-bold text-slate-900">Засах</p>
          </div>
        </div>

        {/* Footer мэдээлэл */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 px-6 py-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-600">
              Систем хэвийн ажиллаж байна
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
