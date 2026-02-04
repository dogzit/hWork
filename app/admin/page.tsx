"use client";
import { useRouter } from "next/navigation";

export default function HomeworkAddPage() {
  const { push } = useRouter();

  return (
    <div className="p-6 space-y-4">
      <div
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => push("/admin/timeTable")}
      >
        Хуваарь өөрчлөх
      </div>

      <div
        className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white"
        onClick={() => push("/admin/hWorkAdd")}
      >
        Даалгавар нэмэх
      </div>
    </div>
  );
}
