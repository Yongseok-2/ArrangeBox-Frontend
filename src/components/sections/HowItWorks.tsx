import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';

const HowItWorks = () => {
    const steps = [
        'AI가 똑똑하게 분류해준 카드 리스트를 가볍게 훑어보세요.',
        '클릭 한 번으로 수백 개의 메일을 박스 안으로 시원하게 비워내요.',
        '깨끗해진 메일함은 기본, 내가 줄인 탄소 발자국을 보며 기분 좋게 마무리하세요.',
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