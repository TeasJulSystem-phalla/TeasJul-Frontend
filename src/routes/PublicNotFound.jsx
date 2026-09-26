import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, Home } from "lucide-react";

const PublicNotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f8f6] px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f0f7]">
        <SearchX className="h-8 w-8 text-[#0f2942]" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#0f2942]">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 max-w-md text-center text-[14px] leading-relaxed text-slate-500">
        {t("notFound.description")}
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#0f2942] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#173a5c]"
      >
        <Home className="h-4 w-4" />
        {t("notFound.backHome")}
      </Link>
    </div>
  );
};

export default PublicNotFound;