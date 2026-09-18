import { Link } from "react-router-dom";

const PublicFooter = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 44 44" className="h-9 w-9" fill="none">
              <path
                d="M22 3 L25.5 18.5 L41 22 L25.5 25.5 L22 41 L18.5 25.5 L3 22 L18.5 18.5 Z"
                fill="#0f2942"
              />
              <path
                d="M22 12 L23.5 20.5 L32 22 L23.5 23.5 L22 32 L20.5 23.5 L12 22 L20.5 20.5 Z"
                fill="#fff"
              />
            </svg>
            <div className="leading-tight">
              <p className="font-khmer text-[13px] font-bold text-[#0f2942]">
                ស្វែងរកផ្ទះ
              </p>
              <p className="text-[10px] font-medium text-slate-500">Rooms</p>
            </div>
          </div>
          <p className="font-khmer mt-4 max-w-[260px] text-[12.5px] leading-relaxed text-slate-500">
            ការប្រើប្រាស់ដ៏ងាយស្រួល និងរហ័សសម្រាប់ស្វែងរកការជួលផ្ទះ ឬបន្ទប់នៅកម្ពុជា។
          </p>
        </div>

        <div>
          <h4 className="font-khmer text-[13px] font-semibold text-[#0f2942]">ទំព័រ</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/public" className="font-khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]">
                ទំព័រដើម
              </Link>
            </li>
            <li>
              <Link to="/public/rooms" className="font-khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]">
                បន្ទប់ជួលទាំងអស់
              </Link>
            </li>
            <li>
              <Link to="/public/marketing" className="font-khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]">
                ហេតុអ្វី TeasJul?
              </Link>
            </li>
            <li>
              <Link to="/public/about" className="font-khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]">
                អំពីយើង
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-khmer text-[13px] font-semibold text-[#0f2942]">ជំនួយ</h4>
          <ul className="mt-4 space-y-2.5 text-[12.5px] text-slate-500">
            <li className="font-khmer">សំណួរញឹកញាប់</li>
            <li className="font-khmer">គោលការណ៍</li>
            <li className="font-khmer">លក្ខខណ្ឌ</li>
          </ul>
        </div>

        <div>
          <h4 className="font-khmer text-[13px] font-semibold text-[#0f2942]">ទំនាក់ទំនង</h4>
          <ul className="mt-4 space-y-2.5 text-[12.5px] text-slate-500">
            <li className="font-khmer">+855 12 345 678</li>
            <li className="font-khmer">hello@rooms.kh</li>
            <li className="font-khmer">ភ្នំពេញ, កម្ពុជា</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-100 pt-6">
        <p className="font-khmer text-center text-[12px] text-slate-400">
          © {new Date().getFullYear()} ស្វែងរកផ្ទះ. រក្សាសិទ្ធិទាំងអស់។
        </p>
      </div>
    </div>
  </footer>
);

export default PublicFooter;