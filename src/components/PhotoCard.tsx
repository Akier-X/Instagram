import { PhotoItem } from "@/lib/photo-types";

type PhotoCardProps = {
  photo: PhotoItem;
  selected: boolean;
  onClick: () => void;
};

export function PhotoCard({ photo, selected, onClick }: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative aspect-square overflow-hidden rounded-2xl border bg-white text-left transition ${
        selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className={`h-full w-full ${photo.preview.kind === "gradient" ? photo.preview.value : "bg-slate-100"}`}>
        {photo.preview.kind === "url" && (
          <img src={photo.preview.value} alt="preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700">
          {photo.score}/30
        </div>
        <div className="absolute bottom-2 right-2 rounded-lg bg-black/65 px-2 py-1 text-xs text-white">{photo.date}</div>
        {selected && (
          <div className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">✓</div>
        )}
      </div>
    </button>
  );
}
