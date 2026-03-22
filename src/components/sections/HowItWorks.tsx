import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';

const HowItWorks = () => {
    const steps = [
        'AI가 메일을 광고, 뉴스레터, 프로모션처럼 그룹으로 나눠 트리아지 카드로 보여줍니다.',
        '사용자는 Arrange Box 액션으로 보관, 삭제, 구독 해지를 한 번에 처리합니다.',
        '탄소 저감 성과와 성장 그래프를 확인하며 뿌듯함을 느낍니다.',
    ];

    return (
        <section id="how-it-works" className="py-16 bg-[#FAFAFA]">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
                    <div>
                        <Badge variant="secondary" className="inline-flex h-auto px-5 py-1 rounded-full bg-orange-100 text-orange-600 text-[13px] font-black tracking-widest mb-5 hover:bg-orange-100 border-none shadow-none">
                            WORKFLOW
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-bold text-neutral-900 leading-[1.15] tracking-tight mb-8">
                            박스에 담고, 비우면 끝납니다.
                        </h2>
                        <p className="text-lg sm:text-xl text-neutral-600 font-medium leading-[1.6]">
                            복잡한 설정이나 하나하나 체크할 필요가 없습니다. <br className="hidden sm:block" />
                            Arrange Box가 분류하고, 당신은 결정만 하세요.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.2 }}
                                className="group flex items-start gap-6 p-6 md:p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-500 font-bold text-xl border border-orange-100 group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <p className="text-lg md:text-xl font-medium text-neutral-700 leading-relaxed pt-2">
                                    {step}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;