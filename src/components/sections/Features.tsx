import { motion } from 'motion/react';
import { Zap, Inbox, Recycle } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: 'AI 트리아지로 더 빠르게.',
            body: '광고, 뉴스레터, 업데이트 메일을 AI가 먼저 묶어 보여주고, 사용자는 몇 번의 클릭만으로 한꺼번에 정리할 수 있습니다. 복잡한 받은메일함을 빠르게 읽히는 카드 구조로 바꿉니다.',
            icon: Zap,
        },
        {
            title: 'Arrange Box의 정리감.',
            body: '메일이 오렌지 박스 안으로 빨려 들어가듯 정리되는 경험을 중심에 두었습니다. 박스는 단순한 버튼이 아니라, 사용자가 정리를 소유하고 있다는 감각을 주는 상징적 인터랙션입니다.',
            icon: Inbox,
        },
        {
            title: '정리할수록 보이는 임팩트.',
            body: '메일 정리량과 탄소 저감 스토리를 함께 보여줘 효율과 지속가능성을 동시에 전달합니다. 숫자와 그래프, 성장 메타포를 통해 메일 정리가 더 의미 있는 습관처럼 느껴지게 합니다.',
            icon: Recycle,
        },
    ];

    return (
        <section id="features" className="py-16 bg-white relative">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 mb-6">
                        메일함을 비우는 <br className="md:hidden" /> 새로운 철학
                    </h2>
                    <p className="text-lg text-neutral-600 font-medium">
                        단순히 지우는 것을 넘어, 과정 자체가 즐겁고 의미 있도록 설계했습니다.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: idx * 0.2, duration: 0.6 }}
                            className="group relative bg-[#FAFAFA] rounded-3xl p-8 border border-neutral-100 hover:border-orange-200 transition-colors"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-8 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 text-orange-500">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
                            <p className="text-neutral-600 leading-relaxed font-medium">
                                {feature.body}
                            </p>

                            {/* Decorative graphic bottom */}
                            <div className="mt-10 pt-6 border-t border-neutral-200/50 flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                                <feature.icon className="h-16 w-16 text-orange-100" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;