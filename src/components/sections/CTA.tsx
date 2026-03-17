const CTA = () => {
    return (
        <section className="relative py-32 bg-orange-500 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 mx-auto max-w-4xl px-6">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-8">
                    지금 바로 <br className="md:hidden" />
                    박스를 비워보세요
                </h2>
                <p className="text-xl md:text-2xl text-orange-50 mb-12 font-medium">
                    이메일 정리가 지구를 살리는 첫 걸음입니다.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="rounded-full bg-white px-8 py-4 text-lg font-bold text-orange-600 shadow-xl transition-transform hover:scale-105 hover:shadow-2xl">
                        Google 계정으로 시작하기
                    </button>
                    <button className="rounded-full bg-orange-600 border border-orange-400 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-700">
                        더 알아보기
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;