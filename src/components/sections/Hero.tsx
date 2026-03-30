import { motion } from 'motion/react';
import { Leaf, ArrowRight, User, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Hero = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const handleStart = () => {
        if (isAuthenticated) {
            navigate('/triage');
        } else {
            navigate('/login');
        }
    };

    return (
        <section className="relative min-h-[85vh] overflow-hidden bg-[#FAFAFA] flex items-center">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-orange-400/5 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/5 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 md:px-10 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <Badge variant="outline" className="inline-flex h-auto items-center gap-2 rounded-full border-orange-200 bg-orange-50 px-5 py-2.5 text-[15px] font-bold text-orange-600 hover:bg-orange-50 shadow-none border">
                            <Leaf className="h-4 w-4" />
                            <span>디지털 탄소 발자국 줄이기 캠페인</span>
                        </Badge>
                        <h1
                            className="text-5xl sm:text-6xl lg:text-[4.5rem] xl:text-[5rem] leading-[1.15] tracking-tight text-neutral-900 mb-6"
                            style={{ fontWeight: 700 }}
                        >
                            이메일 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">정리</span>가 <br />지구를 구합니다.
                        </h1>
                        <p className="text-lg sm:text-xl text-neutral-600 mb-12 leading-[1.6] font-medium">
                            불필요한 메일을 정리하는 가장 스마트한 방법. <br className="hidden sm:block" />
                            Arrange Box는 AI로 메일을 분류하고 한 번에 비워내어 <br className="hidden sm:block" />
                            쾌적한 환경과 지속 가능한 미래를 만듭니다.
                        </p>
                        {/* 둥근 모서리의 시각적 라인을 텍스트 라인과 완전히 맞추기 위한 미세 좌측 당김(-ml-1) */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start justify-start w-full -ml-1">
                            <Button
                                onClick={handleStart}
                                className="group flex h-auto items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30"
                            >
                                무료로 정리 시작하기
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button
                                onClick={() => navigate('/how-it-works')}
                                variant="outline"
                                className="flex h-auto items-center justify-center gap-2 rounded-full bg-white border border-neutral-200 px-8 py-4 text-base font-bold text-neutral-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-neutral-900"
                            >
                                어떻게 작동하나요?
                            </Button>
                        </div>
                    </motion.div>

                    {/* Hero Visuals Redesigned */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="relative h-[480px] lg:h-[580px] w-full flex items-center justify-center mt-12 lg:mt-0"
                    >
                        {/* Background Soft Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.1)_0%,transparent_60%)] -z-10 blur-3xl" />

                        <div className="relative w-full max-w-[550px] h-full flex items-center justify-center">

                            {/* Card 1: Instagram Triage */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute left-0 md:left-2 top-0 md:top-8 w-64 md:w-72 bg-white rounded-[2rem] shadow-xl p-6 z-10 border border-neutral-100/50"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 text-lg">인스타그램</h4>
                                            <p className="text-xs text-neutral-400 font-medium tracking-tight">발신자 그룹</p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest mt-1">
                                        Live
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 bg-opacity-80 rounded-full mb-3">계정 보안</span>
                                    <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px] font-medium tracking-tight">
                                        Chrome 또는 MacOS에서 여러 번의 로그인 시도가 감지되었습니다...
                                    </p>
                                </div>
                                <Button variant="secondary" className="w-full h-auto py-3 bg-neutral-100 text-neutral-600 font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors">
                                    <ShoppingCart className="h-4 w-4" /> 담기
                                </Button>
                            </motion.div>

                            {/* Card 2: Arrange Box Action (Center-Right) */}
                            <motion.div
                                animate={{ y: [-8, 8, -8] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute right-0 md:-right-4 top-40 md:top-28 w-64 md:w-80 bg-[#1C1C1C] rounded-[2.5rem] shadow-2xl p-8 z-20 pb-10"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-orange-500 border border-white/5">
                                            <Trash2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-xl">정리 바구니</h4>
                                            <p className="text-xs text-neutral-400 font-medium">전체 임팩트</p>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-[#086B42] text-white flex items-center justify-center text-xs font-bold border border-white/10 mt-1">
                                        2
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-orange-400">바구니 용량</span>
                                        <span className="text-white">15/128 통</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-[15%] rounded-full shadow-[0_0_10px_rgba(249,116,21,0.5)]"></div>
                                    </div>
                                </div>

                                <Button className="w-full h-auto py-4 bg-orange-500 text-white font-bold text-base md:text-lg rounded-2xl hover:bg-orange-600 transition-all shadow-[0_5px_15px_rgba(249,116,21,0.4)]">
                                    지금 바로 정리하기
                                </Button>
                            </motion.div>

                            {/* Card 3: Growth Impact (Attached to bottom of Card 2) */}
                            <motion.div
                                animate={{ y: [6, -6, 6] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute left-16 md:left-24 bottom-2 md:bottom-6 w-64 md:w-72 bg-[#086B42] rounded-[2.5rem] shadow-xl p-6 z-30 overflow-hidden"
                            >
                                {/* Background Leaf Decoration */}
                                <Leaf className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-[0.05] rotate-12" />
                                <div className="relative z-10">
                                    <p className="text-emerald-200 text-xs font-bold tracking-wider mb-1">불필요한 이메일 1통</p>
                                    <h3 className="text-white text-3xl md:text-[2.5rem] font-black tracking-tight flex items-center gap-1 -ml-1">
                                        4<span className="text-xl md:text-2xl mt-2 font-bold opacity-90">g CO₂</span>
                                    </h3>
                                </div>
                            </motion.div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;