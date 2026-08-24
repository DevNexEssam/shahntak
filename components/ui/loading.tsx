type LoadingProps = {
  bg?: string;
  w?: string
  h?: string
};

export default function Loading({ bg, w, h }: LoadingProps) {
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center bg-zinc-800/30 h-screen w-full">
      <div className={`relative ${w || "w-16"} ${h || "h-16"}`}>
        <div
          className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin ${bg || "border-r-primary"}`}
        ></div>
      </div>
    </div>
  );
}