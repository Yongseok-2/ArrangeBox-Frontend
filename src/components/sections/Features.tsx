import { motion } from 'motion/react';
import { Zap, Inbox, Recycle } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: '복잡한 메일함, 카드 한 장으로.',
            body: '빽빽한 텍스트 대신 깔끔한 카드 구조로 메일함을 다시 디자인했습니다. 이제 읽어야 할 메일과 버려야 할 메일이 한눈에 들어올 거예요.',
            icon: Zap,
        },
        {
            title: '나만의 소중한 정리 상자.',
            body: '어레인지박스는 정리를 소유하는 즐거움을 드리고 싶어요. 박스에 메일을 담아 비울 때마다, 당신의 일상도 조금 더 가벼워질 거예요.',
            icon: Inbox,
        },
        {
            title: '내일의 지구를 위한 작은 발걸음.',
            body: '효율을 넘어 지속가능성을 고민합니다. 내가 오늘 비운 메일이 어떻게 나무를 살리는지 확인해 보세요. 건강한 디지털 라이프의 시작입니다.',
            icon: Recycle,
        },
    ];

    return (
        <section id="features" className="py-16 bg-white relative">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 mb-6">
                        메일 속에 숨은  <br className="md:hidden" /> 탄소 먼지
                    </h2>
                    <p className="text-lg text-neutral-600 font-medium">
                        쓰레기통으로 보낸 메일이 초록색 나무가 됩니다. 당신의 정리가 지구를 숨 쉬게 할 거예요.
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