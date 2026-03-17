import { motion } from 'motion/react';
import { Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Impact = () => {
    const impactCards = [
        {
            label: '일반 이메일 한 통',
            value: '4g',
            suffix: '의 이산화탄소 발생',
            color: 'text-neutral-300',
            bg: 'bg-neutral-100',
            height: 'h-1/3'
        },
        {
            label: '첨부파일이 있다면',
            value: '50g',
            suffix: '으로 배출량 급증',
            color: 'text-orange-500',
            bg: 'bg-orange-100',
            height: 'h-2/3'
        },
        {
            label: '정리된 메일함은',
            value: '지구',
            suffix: '를 숨쉬게 합니다',
            color: 'text-emerald-500',
            bg: 'bg-emerald-100',
            height: 'h-full'
        },
    ];

    return (
        <section id="impact" className="py-24 bg-neutral-900 text-white rounded-t-[3rem] mt-10">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6"
                    >
                        <Recycle className="h-8 w-8 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                        이메일이 지구를 <br className="sm:hidden" />파괴한다고요?
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg sm:text-xl leading-relaxed text-neutral-400 font-medium">
                        보이지 않는 디지털 데이터가 만들어내는 실제적인 탄소 배출. <br className="hidden sm:block" />
                        Arrange Box는 메일 정리를 효율의 문제에서 끝내지 않고, 더 가벼운 디지털 습관으로 확장합니다.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 h-full">
                    {impactCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.2 }}
                            className="relative rounded-[2.5rem] bg-white/5 border border-white/10 p-8 flex flex-col justify-between min-h-[400px] overflow-hidden group hover:bg-white/10 transition-colors"
                        >
                            <div className="relative z-10">
                                <div className="text-lg font-bold text-neutral-400 mb-6">{card.label}</div>
                                <div className={cn("text-6xl sm:text-7xl font-black mb-4 tracking-tighter", card.color)}>
                                    {card.value}
                                </div>
                                <div className="text-xl text-neutral-300 font-medium">{card.suffix}</div>
                            </div>

                            {/* Visual Graph Representation */}
                            <div className="absolute bottom-0 left-0 right-0 h-48 bg-white/5 flex items-end p-4 z-0 rounded-b-[2.5rem] opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="w-full h-full flex items-end gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: index === 0 ? `${(i + 1) * 10}%` : index === 1 ? `${(i + 1) * 20}%` : `${100 - (i * 15)}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.2 + i * 0.1, duration: 0.8 }}
                                            className={cn("flex-1 rounded-t-lg", index === 0 ? 'bg-neutral-600' : index === 1 ? 'bg-orange-500/80' : 'bg-emerald-500/80')}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Impact;