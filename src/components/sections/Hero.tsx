import { motion } from 'motion/react';
import { Leaf, ArrowRight, Mail, Inbox, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

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
        <section className="relative min-h-[90vh] overflow-hidden bg-[#FAFAFA] pt-32 pb-20 flex items-center">
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 mb-6">
                            <Leaf className="h-4 w-4" />
                            <span>디지털 탄소 발자국 줄이기 캠페인</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-neutral-900 mb-6">당신의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">박스</span>가 <br />지구를 구합니다.</h1>
                        <p className="text-lg sm:text-xl text-neutral-600 mb-10 leading-relaxed font-medium">
                            불필요한 메일을 정리하는 가장 스마트한 방법. <br className="hidden sm:block" />
                            Arrange Box는 AI로 메일을 분류하고 한 번에 비워내어 <br className="hidden sm:block" />
                            쾌적한 환경과 지속 가능한 미래를 만듭니다.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleStart}
                                className="group flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30"
                            >
                                무료로 정리 시작하기
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-full bg-white border border-neutral-200 px-8 py-4 text-base font-bold text-neutral-700 transition-all hover:border-orange-200 hover:bg-orange-50">
                                어떻게 작동하나요?
                            </button>
                        </div>


                    </motion.div>

                    {/* Hero Visuals */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="relative lg:h-[600px] flex items-center justify-center"
                    >
                        {/* Main Interactive Card */}
                        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 border border-neutral-100 p-6 md:p-8 overflow-hidden z-20">
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 to-emerald-400" />
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-neutral-900">오늘의 트리아지</h3>
                                    <p className="text-sm text-neutral-500 mt-1">AI가 한 번에 정리 가능한 그룹을 추천합니다</p>
                                </div>
                                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                    BULK
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: '광고 메일', count: '128개', saved: '512g CO₂ 절감', icon: Mail, color: 'text-orange-500', bg: 'bg-orange-50' },
                                    { title: '뉴스레터', count: '64개', saved: '256g CO₂ 절감', icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { title: '오래된 첨부파일', count: '31개', saved: '1.2kg CO₂ 절감', icon: Trash2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                        className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-md cursor-pointer"
                                    >
                                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", item.bg, item.color)}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-neutral-900 truncate">{item.title}</span>
                                                <span className="text-sm font-semibold text-neutral-400">{item.count}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                <Leaf className="h-3 w-3" />
                                                {item.saved}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-8 w-full rounded-2xl border border-dashed border-orange-300 bg-orange-50 py-5 text-center text-orange-600 transition-colors hover:bg-orange-100"
                            >
                                <div className="text-xs font-bold tracking-[0.2em] mb-2">ARRANGE BOX</div>
                                <div className="text-2xl font-bold">모두 상자에 담아 비우기</div>
                            </motion.button>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -right-12 top-20 bg-white p-4 rounded-2xl shadow-xl shadow-emerald-500/10 border border-neutral-100 z-30 hidden md:flex items-center gap-3"
                        >
                            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium">이번 달 절감량</p>
                                <p className="text-sm font-bold text-neutral-900">4.2kg CO₂</p>
                            </div>
                        </motion.div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.1)_0%,transparent_60%)] -z-10 rounded-full blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;