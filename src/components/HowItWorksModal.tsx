import { Trash2, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HowItWorksModal = ({ isOpen, onClose }: HowItWorksModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                        className="relative w-full max-w-5xl bg-neutral-50/95 rounded-[2rem] shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden border border-neutral-200"
                    >
                        {/* 우측 상단 닫기 (X) 버튼 */}
                        <div className="absolute right-6 top-6 z-20">
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 shadow-sm border border-neutral-200/60 transition-all hover:bg-neutral-100 hover:scale-105"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* 메인 스크롤 영역 */}
                        <div className="flex-1 overflow-y-auto px-6 py-12 md:p-16 scrollbar-hide">
                            <div className="max-w-4xl mx-auto">

                                {/* 헤더 */}
                                <div className="mb-16 text-center mt-4">
                                    <h1 className="text-4xl md:text-5xl tracking-tight text-neutral-900 mb-4" style={{ fontWeight: 700 }}>
                                        Arrange Box <span className="text-emerald-500">사용 설명서</span>
                                    </h1>
                                    <p className="text-lg text-neutral-500 font-medium">
                                        마음은 가볍게, 지구는 깨끗하게. Arrange Box와 함께 시작해 볼까요?
                                    </p>
                                </div>

                                {/* Step 1: 메일 가져오기 및 분류 */}
                                <section className="mb-24 flex flex-col md:flex-row gap-10 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="w-10 h-10 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">1</div>
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">메일함 속 숨은 먼지 찾기</h2>
                                        <p className="text-neutral-500 leading-relaxed font-medium">
                                            구글 계정을 연결하면 AI가 조용히 메일함을 살피기 시작해요. 나도 모르게 쌓여있던 광고와 뉴스레터, 즉 '탄소 먼지'들을 찾아내어 정성껏 분류해 드릴게요. 상단 바에서 먼지가 털어지는 과정을 지켜봐 주세요.
                                        </p>
                                    </div>
                                    {/* UI Mockup 1 */}
                                    <div className="flex-1 w-full bg-white border border-neutral-200 shadow-sm rounded-3xl p-6 pointer-events-none select-none">
                                        <div className="flex flex-col gap-6">
                                            <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
                                                나의 <span className="text-emerald-500">메일</span>보관함
                                            </h3>
                                            <div className="flex items-center gap-4 bg-white border border-neutral-200/60 px-5 py-3.5 rounded-2xl shadow-sm">
                                                <div className="flex flex-col flex-1">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[11px] font-bold text-neutral-400 tracking-wide uppercase">메일 분석 현황</span>
                                                        <span className="text-[12px] font-black text-emerald-600">307 / 500통 (61%)</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full w-[61%]" />
                                                    </div>
                                                </div>
                                                <div className="w-[1px] h-6 bg-neutral-200/50 mx-1"></div>
                                                <div className="p-2 text-neutral-400">
                                                    <RotateCcw size={15} strokeWidth={2.5} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="w-full border-t border-dashed border-neutral-200 mb-24" />

                                {/* Step 2: 그룹 묶어 보기 */}
                                <section className="mb-24 flex flex-col md:flex-row-reverse gap-10 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="w-10 h-10 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">2</div>
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">복잡한 일상을 카드 한 장에</h2>
                                        <p className="text-neutral-500 leading-relaxed font-medium">
                                            빽빽한 목록 때문에 답답하셨죠? 비슷한 마음을 담은 메일들을 예쁜 카드 뭉치로 묶어두었어요. 카드를 톡- 하고 펼치면 숨어있던 메일들이 나타납니다. 복잡했던 메일함이 한눈에 정리되는 평화로움을 느껴보세요.
                                        </p>
                                    </div>
                                    {/* UI Mockup 2 */}
                                    <div className="flex-1 w-full flex flex-col gap-3 pointer-events-none select-none">
                                        <div className="bg-white/80 border border-neutral-200 rounded-2xl p-4 flex items-center shadow-sm">
                                            <div className="w-4 h-4 rounded border-2 border-neutral-300 mr-4 flex-shrink-0" />
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-400 text-sm mr-4">Ne</div>
                                            <div className="flex-1">
                                                <div className="font-bold text-neutral-900 text-[15px]">Netflix</div>
                                                <div className="text-[12px] text-neutral-400 font-medium">프로모션</div>
                                            </div>
                                            <div className="text-[12px] font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200/60 mr-4">
                                                4개
                                            </div>
                                            <div className="text-neutral-300">▼</div>
                                        </div>
                                        <div className="bg-white border-2 border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                                            <div className="bg-neutral-50/50 p-4 border-b border-neutral-200/60 flex items-center">
                                                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                                                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 stroke-current stroke-[3]"><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm mr-4">Ca</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-neutral-900 text-[15px]">Careerly</div>
                                                    <div className="text-[12px] text-neutral-400 font-medium">뉴스레터</div>
                                                </div>
                                                <div className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mr-4">
                                                    2개 선택됨
                                                </div>
                                                <div className="text-neutral-300">▲</div>
                                            </div>
                                            <div className="p-2 space-y-1 bg-white">
                                                <div className="p-3 border-b border-neutral-100 flex items-center text-[13px]">
                                                    <div className="w-4 h-4 mr-3 flex-shrink-0" />
                                                    <span className="font-semibold text-neutral-800 flex-1 truncate">금주 직무 관련 소식입니다!</span>
                                                    <span className="text-neutral-400 font-medium ml-2">24.03.20</span>
                                                </div>
                                                <div className="p-3 flex items-center text-[13px]">
                                                    <div className="w-4 h-4 mr-3 flex-shrink-0" />
                                                    <span className="font-semibold text-neutral-800 flex-1 truncate">관심 기업 채용 공고를 확인하세요</span>
                                                    <span className="text-neutral-400 font-medium ml-2">24.03.11</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="w-full border-t border-dashed border-neutral-200 mb-24" />

                                {/* Step 3: 바구니와 일괄 행동 */}
                                <section className="mb-24 flex flex-col md:flex-row gap-10 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="w-10 h-10 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">3</div>
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">정리바구니에 담아 보내는 가벼움</h2>
                                        <p className="text-neutral-500 leading-relaxed font-medium">
                                            비우고 싶은 메일들을 골라 나만의 소중한 정리바구니에 담아보세요. 박스 안으로 메일이 쏙- 빨려 들어가는 순간, 쌓여있던 일상의 무게도 함께 가벼워질 거예요. 삭제부터 보관까지, 한 번의 액션으로 기분 좋게 비워내세요.
                                        </p>
                                    </div>
                                    {/* UI Mockup 3 - 리디자인된 바구니 UI 반영 */}
                                    <div className="flex-1 w-full pointer-events-none select-none flex justify-center py-8">
                                        <div className="bg-[#1C1C1C] rounded-[2.5rem] p-8 w-[320px] shadow-2xl relative overflow-hidden flex flex-col h-[520px] border border-neutral-800">
                                            <div className="flex justify-between items-start mb-10 relative z-10 px-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-orange-500 border border-white/10 shadow-inner">
                                                        <Trash2 className="w-6 h-6" strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h2 className="text-[22px] tracking-tight leading-tight" style={{ fontWeight: 700, color: '#ffffff' }}>정리 바구니</h2>
                                                    </div>
                                                </div>
                                                <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[15px] font-black border border-orange-500/30">
                                                    6
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-hidden pr-2 space-y-4 relative z-10">
                                                <div className="bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-700/50 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="bg-neutral-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-neutral-400 tracking-wide uppercase">
                                                            프로모션
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold text-neutral-200">Netflix 관련 메일 4통</div>
                                                </div>
                                                <div className="bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-700/50 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="bg-neutral-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-neutral-400 tracking-wide uppercase">
                                                            뉴스레터
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold text-neutral-200">Careerly 소식 2통</div>
                                                </div>
                                            </div>
                                            <div className="pt-8 border-t border-neutral-800/80 relative z-10 mt-auto">
                                                <div className="flex justify-between items-end mb-6 px-1">
                                                    <div>
                                                        <p className="text-[11px] text-emerald-500 font-bold mt-0.5">탄소 절감량</p>
                                                    </div>
                                                    <p className="text-[28px] leading-none font-black text-emerald-500" style={{ fontWeight: 700 }}>
                                                        2.4<span className="text-sm font-bold tracking-tight text-emerald-600">g CO₂</span>
                                                    </p>
                                                </div>
                                                <button className="w-full h-[60px] bg-orange-500 text-white font-bold text-lg rounded-2xl shadow-lg border-t border-orange-400/30 flex items-center justify-center gap-2">
                                                    <span className="tracking-wide">지금 바로 정리하기</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="w-full border-t border-dashed border-neutral-200 mb-24" />

                                {/* Step 4: 결과와 임팩트 */}
                                <section className="mb-24 flex flex-col md:flex-row-reverse gap-10 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="w-10 h-10 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">4</div>
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">지구에게 건네는 다정한 선물</h2>
                                        <p className="text-neutral-500 leading-relaxed font-medium">
                                            정리를 마치면 내가 비워낸 탄소 발자국이 얼마나 줄었는지 확인해 보세요. 단순히 메일을 지우는 것을 넘어, 나의 작은 배려가 어떻게 지구를 다시 숨 쉬게 하는지 보여드릴게요. 깨끗해진 메일함만큼이나 뿌듯한 하루가 될 거예요.
                                        </p>
                                    </div>
                                    {/* UI Mockup 4 */}
                                    <div className="flex-1 w-full bg-emerald-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-sm pointer-events-none select-none">
                                        <span className="text-xs font-bold text-emerald-600 mb-2 z-10 w-full text-center tracking-widest uppercase">당신의 환경적 영향력</span>
                                        <div className="flex items-end gap-3 z-10 my-4">
                                            <span className="text-6xl font-black text-emerald-600 tracking-tighter">
                                                4.0
                                            </span>
                                            <span className="text-2xl tracking-tight font-bold text-emerald-600 mb-2 leading-none">g CO₂</span>
                                        </div>
                                        <p className="text-[13px] font-bold text-emerald-700/60 z-10 text-center bg-white/50 px-4 py-2 rounded-full border border-emerald-100 uppercase mt-2">
                                            성장 지표 대시보드
                                        </p>
                                        <div className="absolute w-[200px] h-[200px] bg-emerald-200/40 rounded-full blur-[40px] z-0 -right-20 -top-20"></div>
                                        <div className="absolute w-[150px] h-[150px] bg-white/40 rounded-full blur-[20px] z-0 -left-10 -bottom-10"></div>
                                    </div>
                                </section>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HowItWorksModal;
