import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Inbox, Star, AlertCircle, Mail, HelpCircle, Tag, Zap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';

// Types for Preview Request
interface TriagePreviewReq {
    max_unread: number;
    max_read: number;
}

// Fetch function
const fetchTriagePreview = async () => {
    const req: TriagePreviewReq = {
        max_unread: 200,
        max_read: 200,
    };
    const response = await apiClient.post('/emails/triage/preview-db', req);
    return response.data;
};

export default function TriagePage() {
    const [activeTab, setActiveTab] = useState('unread');
    const accountId = useAuthStore((state) => state.accountId);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['triage-preview-db'],
        queryFn: fetchTriagePreview,
        enabled: !!accountId,
    });

    const buckets = data?.buckets || [];
    const currentBucket = buckets.find((b: any) => b.bucket === activeTab) || { count: 0, label_groups: [] };
    // Default fallback to show something even if empty or loading
    const displayItems = currentBucket.label_groups.length > 0
        ? currentBucket.label_groups
        : [];

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center p-6 text-neutral-900 font-sans">
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: Digital Greenhouse */}
                <aside className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-neutral-200/60 p-8 shadow-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <Leaf size={32} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mb-2 text-neutral-900">나의 디지털 온실</h2>
                        <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                            AI가 {data?.total_count || 0}개의 메시지를 환경적 기준으로 분류했습니다.
                        </p>
                        <div className="w-full py-4 px-6 bg-neutral-100 rounded-full border border-neutral-200 mb-4">
                            <span className="block text-xs font-semibold text-emerald-600 mb-1">성장 지표</span>
                            {/* Todo: Calculate actual CO2 based on count */}
                            <span className="text-2xl font-black text-neutral-900">{((data?.total_count || 0) * 0.03).toFixed(1)}kg <span className="text-sm font-medium text-neutral-500">CO2</span></span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-neutral-200/60 p-6 shadow-xl flex flex-col gap-2">
                        <SidebarBtn icon={<Mail size={18} />} label="안 읽음" active={activeTab === 'unread'} onClick={() => setActiveTab('unread')} count={buckets.find((b: any) => b.bucket === 'unread')?.count} />
                        <SidebarBtn icon={<Inbox size={18} />} label="읽음" active={activeTab === 'read'} onClick={() => setActiveTab('read')} count={buckets.find((b: any) => b.bucket === 'read')?.count} />
                        <SidebarBtn icon={<AlertCircle size={18} />} label="중요" active={activeTab === 'important'} onClick={() => setActiveTab('important')} count={buckets.find((b: any) => b.bucket === 'important')?.count} />
                        <SidebarBtn icon={<Star size={18} />} label="별표" active={activeTab === 'starred'} onClick={() => setActiveTab('starred')} count={buckets.find((b: any) => b.bucket === 'starred')?.count} />
                        <SidebarBtn icon={<Tag size={18} />} label="라벨됨" active={activeTab === 'label'} onClick={() => setActiveTab('label')} count={buckets.find((b: any) => b.bucket === 'label')?.count} />
                        <SidebarBtn icon={<HelpCircle size={18} />} label="도움말" active={false} onClick={() => { }} />
                    </div>
                </aside>

                {/* Main Content: Triage Cards */}
                <main className="lg:col-span-3 flex flex-col gap-6">
                    <header className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{accountId ? `${accountId}'s Mailbox` : 'Loading...'}</h1>
                        <Badge className="bg-[#F97415] hover:bg-[#F97415]/90 text-white rounded-full px-4 py-1.5 flex gap-2 items-center border-0">
                            <Zap size={14} fill="currentColor" />
                            <span>Connected via AI sorting</span>
                        </Badge>
                    </header>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-20 bg-neutral-100/50 rounded-[2.5rem] border border-neutral-200/60">
                            <Loader2 className="w-10 h-10 animate-spin text-[#F97415] mb-4" />
                            <p className="text-neutral-500">메일함 정보를 분석 중입니다...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center p-20 bg-red-50 rounded-[2.5rem] border border-red-200">
                            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                            <p className="text-red-600">내용을 불러오는 데 실패했습니다.</p>
                        </div>
                    )}

                    {!isLoading && !isError && displayItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-20 bg-neutral-100/50 rounded-[2.5rem] border border-neutral-200/60 text-center">
                            <Inbox className="w-16 h-16 text-neutral-400 mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">해당 그룹에 표시할 메시지가 없습니다.</h3>
                            <p className="text-neutral-500">모든 이메일이 깔끔하게 정리되었어요!</p>
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <AnimatePresence mode="popLayout">
                            {displayItems.map((group: any) =>
                                group.senders.map((senderGroup: any, i: number) => (
                                    <motion.div
                                        key={`${group.label_group}-${senderGroup.sender}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-neutral-200/60 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group/card"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover/card:text-[#F97415] transition-colors">{senderGroup.sender}</h3>
                                                <p className="text-sm text-neutral-500">발신자 그룹 • {senderGroup.count}개의 메시지</p>
                                            </div>
                                            <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full px-6 py-2 text-sm font-semibold transition-colors border border-transparent disabled:opacity-50">
                                                리뷰하기
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {senderGroup.categories.flatMap((cat: any) => cat.sample_subjects).map((subject: string, j: number) => (
                                                <div key={j} className="bg-neutral-100 rounded-2xl p-4 text-sm text-neutral-600 border border-transparent hover:border-neutral-300 transition-colors cursor-pointer truncate">
                                                    {subject}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    )}

                </main>
            </div>
        </div>
    );
}

function SidebarBtn({ icon, label, active, onClick, count }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, count?: number }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between w-full px-6 py-4 rounded-full text-sm font-semibold transition-all duration-300 border border-transparent relative overflow-hidden",
                active
                    ? "bg-[#F97415] text-white shadow-lg shadow-[#F97415]/20"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            )}
        >
            <div className="flex items-center gap-3 relative z-10">
                {icon}
                <span>{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full relative z-10", active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600")}>
                    {count}
                </span>
            )}
            {active && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-full border border-neutral-200" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} style={{ zIndex: 0 }} />
            )}
        </button>
    );
}
