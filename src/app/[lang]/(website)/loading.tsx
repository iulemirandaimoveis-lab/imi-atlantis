export default function Loading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
            <div className="relative">
                {/* Casca navy (#0B1928): o arco preto original ficava invisivel. */}
                <div className="w-12 h-12 rounded-full border-4 border-white/15 border-t-[#C8A44A] animate-spin" />
            </div>
        </div>
    )
}
