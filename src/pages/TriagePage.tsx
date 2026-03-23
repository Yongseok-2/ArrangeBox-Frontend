import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Inbox, Star, AlertCircle, Mail, HelpCircle, Tag, Zap, Loader2, User, Trash2, Archive, X, ExternalLink, ArrowUp, ChevronDown, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiClient } from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useBasketStore } from '@/store/useBasketStore';

// Types for Preview Request
interface TriagePreviewReq {
    max_unread: number;
    max_read: number;
}

interface BasketItem {
    id: string;
    sender: string;
    subject: string;
}

interface TriageActionResponse {
    success_count: number;
    failed_count: number;
    partial_failed: boolean;
    failed_ids: string[];
}

// API: 삭제 액션 실행
const executeTriageAction = async (payload: {
    account_id: string;
    action: string;
    message_ids: string[];
}): Promise<TriageActionResponse> => {
    const response = await apiClient.post('/emails/triage/action', {
        ...payload,
        user_id: 'me',
    });
    return response.data;
};

// API: 라벨 추가/제거 (중요, 별표 등)
const executeLabelAction = async (payload: {
    account_id: string;
    message_ids: string[];
    add_label_ids: string[];
    remove_label_ids?: string[];
}): Promise<TriageActionResponse> => {
    const response = await apiClient.post('/emails/labels', {
        ...payload,
        user_id: 'me',
        remove_label_ids: payload.remove_label_ids || [],
    });
    return response.data;
};

// Fetch function
const fetchTriagePreview = async () => {
    const req: TriagePreviewReq = {
        max_unread: 200,
        max_read: 200,
    };
    const response = await apiClient.post('/emails/triage/preview-db', req);
    return response.data;
};

const tabLabelMap: Record<string, string> = {
    'unread': '안 읽은',
    'read': '읽은',
    'important': '중요',
    'starred': '별표 표시된',
    'label': '라벨 지정된',
};

export default function TriagePage() {
    const [activeTab, setActiveTab] = useState('unread');
    const [selectedMails, setSelectedMails] = useState<BasketItem[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [failedQueue, setFailedQueue] = useState<BasketItem[]>([]);
    const [trashSuccess, setTrashSuccess] = useState(false);
    const [actionMode, setActionMode] = useState<'trash' | 'archive' | 'star' | 'label'>('trash');
    const [executedIds, setExecutedIds] = useState<Set<string>>(new Set()); // 낙관적 업데이트: 액션 완료된 ID
    const [showConfirmModal, setShowConfirmModal] = useState(false); // 실행 전 확인 모달
    const accountId = useAuthStore((state) => state.accountId);

    // 바구니 상태 - Zustand store (탭 전환/리마운트 시에도 유지)
    const { basket, addAll, removeBySender, removeById, restoreItems } = useBasketStore();

    const mainRef = useRef<HTMLElement>(null);
    const [showTopBtn, setShowTopBtn] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        setShowTopBtn(e.currentTarget.scrollTop > 300);
    };

    const scrollToTop = () => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['triage-preview-db'],
        queryFn: fetchTriagePreview,
        enabled: !!accountId,
    });

    const buckets = data?.buckets || [];
    const currentBucket = buckets.find((b: any) => b.bucket === activeTab) || { count: 0, label_groups: [] };
    const displayItems = currentBucket.label_groups.length > 0 ? currentBucket.label_groups : [];

    const toggleSelection = (item: BasketItem) => {
        setSelectedMails(prev =>
            prev.some(m => m.id === item.id) ? prev.filter(m => m.id !== item.id) : [...prev, item]
        );
    };

    const addAllToBasket = (items: BasketItem[]) => {
        addAll(items);  // store action으로 중복 제거 후 추가
        setSelectedMails(prev => prev.filter(sm => !items.some(newItem => newItem.id === sm.id)));
    };

    const addSelectedToBasket = () => {
        addAllToBasket(selectedMails);
    };

    const removeFromBasket = (senderName: string) => {
        removeBySender(senderName);  // store action
    };

    const removeSingleFromBasket = (id: string) => {
        removeById(id);  // store action
    };

    const toggleGroup = (senderName: string) => {
        setExpandedGroups(prev =>
            prev.includes(senderName) ? prev.filter(n => n !== senderName) : [...prev, senderName]
        );
    };

    // actionMode에 따라 낙관적 실행 - UI 즉시 제거 후 API 호출
    const trashMutation = useMutation({
        mutationFn: ({ ids, action }: { ids: string[]; action: string }) =>
            executeTriageAction({ account_id: accountId || '', action, message_ids: ids }),
        onMutate: ({ ids }) => {
            const trashingItems = basket.filter(item => ids.includes(item.id));
            // 낙관적 업데이트 1: 바구니에서 즉시 제거
            ids.forEach(id => removeById(id));
            // 낙관적 업데이트 2: 중앙 목록에서도 즉시 숨김
            setExecutedIds(prev => new Set([...prev, ...ids]));
            return { trashingItems, executedIdsSnapshot: ids };
        },
        onSuccess: (result, _vars, context) => {
            if (result.partial_failed && result.failed_ids.length > 0) {
                // 일부 실패: 실패 메일을 failedQueue에 추가 + executedIds에서 실패 ID 제거
                const failedItems = (context?.trashingItems || []).filter(
                    item => result.failed_ids.includes(item.id)
                );
                setFailedQueue(prev => [...prev, ...failedItems]);
                setExecutedIds(prev => {
                    const next = new Set(prev);
                    result.failed_ids.forEach((id: string) => next.delete(id));
                    return next;
                });
                restoreItems(failedItems); // 실패한 것만 바구니 에 되살림
            } else {
                setTrashSuccess(true);
                setTimeout(() => setTrashSuccess(false), 3000);
            }
        },
        onError: (_err, _vars, context) => {
            // 완전 실패: 낙관적 업데이트 전체 롤백
            if (context?.trashingItems) {
                restoreItems(context.trashingItems);
            }
            if (context?.executedIdsSnapshot) {
                setExecutedIds(prev => {
                    const next = new Set(prev);
                    context.executedIdsSnapshot.forEach((id: string) => next.delete(id));
                    return next;
                });
            }
        },
    });

    // 중요/별표: POST /emails/labels API 뮤테이션
    const labelMutation = useMutation({
        mutationFn: ({ ids, addLabels }: { ids: string[]; addLabels: string[] }) =>
            executeLabelAction({ account_id: accountId || '', message_ids: ids, add_label_ids: addLabels }),
        onMutate: ({ ids }) => {
            const actingItems = basket.filter(item => ids.includes(item.id));
            ids.forEach(id => removeById(id));
            setExecutedIds(prev => new Set([...prev, ...ids]));
            return { actingItems, executedIdsSnapshot: ids };
        },
        onSuccess: (result, _vars, context) => {
            if (result.partial_failed && result.failed_ids.length > 0) {
                const failedItems = (context?.actingItems || []).filter(
                    item => result.failed_ids.includes(item.id)
                );
                setFailedQueue(prev => [...prev, ...failedItems]);
                setExecutedIds(prev => {
                    const next = new Set(prev);
                    result.failed_ids.forEach((id: string) => next.delete(id));
                    return next;
                });
                restoreItems(failedItems);
            } else {
                setTrashSuccess(true);
                setTimeout(() => setTrashSuccess(false), 3000);
            }
        },
        onError: (_err, _vars, context) => {
            if (context?.actingItems) restoreItems(context.actingItems);
            if (context?.executedIdsSnapshot) {
                setExecutedIds(prev => {
                    const next = new Set(prev);
                    context.executedIdsSnapshot.forEach((id: string) => next.delete(id));
                    return next;
                });
            }
        },
    });

    // 실행 버튼 클릭 → 모달 오픈
    const handleExecuteAction = () => {
        if (basket.length === 0 || trashMutation.isPending || labelMutation.isPending) return;
        setShowConfirmModal(true);
    };

    // 모달 확인 → actionMode에 따라 올바른 API로 라우팅
    const confirmAndExecute = () => {
        setShowConfirmModal(false);
        const ids = basket.map(item => item.id);
        if (actionMode === 'archive') {
            // 중요 편지함: IMPORTANT 라벨 추가
            labelMutation.mutate({ ids, addLabels: ['IMPORTANT'] });
        } else if (actionMode === 'star') {
            // 별표 편지함: STARRED 라벨 추가
            labelMutation.mutate({ ids, addLabels: ['STARRED'] });
        } else {
            // trash: POST /emails/triage/action
            trashMutation.mutate({ ids, action: 'trash' });
        }
    };

    // failedQueue 재시도
    const handleRetryFailed = () => {
        if (failedQueue.length === 0) return;
        const ids = failedQueue.map(item => item.id);
        setFailedQueue([]);
        trashMutation.mutate({ ids, action: 'trash' }); // 재시도는 항상 trash
    };

    const basketGroups = basket.reduce((acc, item) => {
        if (!acc[item.sender]) acc[item.sender] = [];
        acc[item.sender].push(item);
        return acc;
    }, {} as Record<string, BasketItem[]>);

    // 모드별 확인 모달 메시지 맵
    const confirmConfig = {
        trash: { title: '정말 삭제하시겠습니까?', desc: `선택한 ${basket.length}통의 메일을 Gmail 휴지통으로 이동합니다.`, color: 'red', icon: <Trash2 size={22} /> },
        archive: { title: '중요 편지함으로 이동할까요?', desc: `선택한 ${basket.length}통의 메일을 중요 편지함으로 이동합니다.`, color: 'amber', icon: <Archive size={22} /> },
        star: { title: '별표 편지함으로 이동할까요?', desc: `선택한 ${basket.length}통의 메일을 별표 편지함으로 이동합니다.`, color: 'yellow', icon: <Star size={22} /> },
        label: { title: '선택한 메일에 라벨을 추가할까요?', desc: `선택한 ${basket.length}통의 메일에 라벨을 추가합니다.`, color: 'emerald', icon: <Tag size={22} /> },
    } as const;

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-[#FAFAFA] font-sans overflow-hidden">

            {/* ===== 확인 모달 ===== */}
            <AnimatePresence>
                {showConfirmModal && (() => {
                    const cfg = confirmConfig[actionMode];
                    const colorMap = {
                        red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'bg-red-500/20 text-red-400', btn: 'bg-red-500 hover:bg-red-600', text: 'text-red-400' },
                        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'bg-amber-500/20 text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-400' },
                        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'bg-yellow-500/20 text-yellow-400', btn: 'bg-yellow-500 hover:bg-yellow-600', text: 'text-yellow-400' },
                        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'bg-emerald-500/20 text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-400' },
                    };
                    const c = colorMap[cfg.color];
                    return (
                        <motion.div
                            key="confirm-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowConfirmModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 w-[380px] shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* 아이콘 */}
                                <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center mb-5`}>
                                    {cfg.icon}
                                </div>

                                {/* 제목 · 설명 */}
                                <h3 className="text-[20px] font-black text-white mb-2">{cfg.title}</h3>
                                <p className="text-[13px] text-neutral-400 leading-relaxed" style={{ marginBottom: '1.5rem' }}>{cfg.desc}</p>

                                {/* 버튼 */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-neutral-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={confirmAndExecute}
                                        className={`flex-1 py-3 rounded-2xl text-[13px] font-black text-white ${c.btn} transition-all shadow-lg`}
                                    >
                                        확인
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            <div className="flex h-full w-full">
                {/* LEFT SIDEBAR */}
                <aside className="w-[240px] flex-shrink-0 pt-10 pb-6 px-4 flex flex-col border-r border-neutral-200/50 bg-[#FAFAFA] overflow-y-auto">
                    <div className="mb-10 pl-2">
                        <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest break-words pr-2">
                            {accountId ? `${accountId.split('@')[0]}\n@GMAIL.COM` : 'USER@GMAIL.COM'}'S MAILBOX
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1 font-medium">
                            <Zap size={10} className="text-emerald-500" />
                            Connected via AI sorting
                        </p>
                    </div>

                    <nav className="flex flex-col gap-1.5">
                        <SidebarBtn icon={<Mail size={18} />} label="안 읽음" active={activeTab === 'unread'} onClick={() => { setActiveTab('unread'); setSelectedMails([]); }} count={buckets.find((b: any) => b.bucket === 'unread')?.count} />
                        <SidebarBtn icon={<Inbox size={18} />} label="읽음" active={activeTab === 'read'} onClick={() => { setActiveTab('read'); setSelectedMails([]); }} count={buckets.find((b: any) => b.bucket === 'read')?.count} />
                        <SidebarBtn icon={<AlertCircle size={18} />} label="중요" active={activeTab === 'important'} onClick={() => { setActiveTab('important'); setSelectedMails([]); }} count={buckets.find((b: any) => b.bucket === 'important')?.count} />
                        <SidebarBtn icon={<Star size={18} />} label="별표" active={activeTab === 'starred'} onClick={() => { setActiveTab('starred'); setSelectedMails([]); }} count={buckets.find((b: any) => b.bucket === 'starred')?.count} />
                        <SidebarBtn icon={<Tag size={18} />} label="라벨됨" active={activeTab === 'label'} onClick={() => { setActiveTab('label'); setSelectedMails([]); }} count={buckets.find((b: any) => b.bucket === 'label')?.count} />
                    </nav>

                    <div className="mt-auto pt-6">
                        <SidebarBtn icon={<HelpCircle size={18} />} label="도움말" active={false} onClick={() => { }} />
                    </div>
                </aside>

                {/* CENTER MAIN CONTENT */}
                <main
                    ref={mainRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-10 pt-12 pb-32 flex flex-col items-center relative scrollbar-hide"
                >

                    <div className="flex justify-between items-start mb-10 w-full max-w-4xl">
                        <div>
                            <h1 className="text-4xl text-neutral-900 tracking-tight flex items-center gap-2 mb-3" style={{ fontWeight: 700 }}>
                                나의 <span className="text-emerald-500 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">메일</span>보관함
                            </h1>
                            <p className="text-neutral-500 text-[15px]">
                                AI가 <strong className="text-neutral-900">{currentBucket.count}개의 {tabLabelMap[activeTab] || '메시지'}</strong> 메일을 분류했습니다.
                            </p>
                        </div>
                        <div className="bg-emerald-50 rounded-[2rem] px-8 py-3.5 flex flex-col items-end relative overflow-hidden shadow-sm">
                            <span className="text-[10px] font-bold text-emerald-600 mb-0.5 z-10 w-full text-left">성장 지표</span>
                            <div className="flex items-center gap-2 z-10">
                                <span className="text-3xl font-black text-emerald-600 tracking-tight">{((data?.total_count || 0) * 0.4).toFixed(1)}<span className="text-lg tracking-normal font-bold">g CO2</span></span>
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <Leaf size={14} />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl z-0"></div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-20 w-full max-w-4xl text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                            <p className="text-neutral-500 font-medium">조용히 메일을 분석하는 중입니다...</p>
                        </div>
                    )}

                    {!isLoading && !isError && displayItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-20 w-full max-w-4xl text-center">
                            <Inbox className="w-16 h-16 text-neutral-300 mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">지구가 조금 더 푸르러졌어요!</h3>
                            <p className="text-neutral-500">이 그룹의 모든 이메일 정리를 마쳤습니다.</p>
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <AnimatePresence mode="popLayout">
                            <div className="flex flex-col gap-8 w-full max-w-4xl">
                                {displayItems.map((group: any) =>
                                    group.senders.map((senderGroup: any, i: number) => {
                                        // 바구니 및 낙관적 제거된 메일 제외 후 표시
                                        const availableMails = senderGroup.categories.flatMap((cat: any) =>
                                            cat.sample_subjects.map((subject: string, idx: number) => ({
                                                subject,
                                                id: cat.message_ids?.[idx] || `${senderGroup.sender}-${idx}`,
                                                sender: senderGroup.sender,
                                            }))
                                        ).filter((m: any) =>
                                            !basket.some(b => b.id === m.id) &&
                                            !executedIds.has(m.id)  // 낙관적 업데이트: 액션 실행된 메일 즉시 숨김
                                        );

                                        if (availableMails.length === 0) return null;

                                        return (
                                            <motion.div
                                                key={`${group.label_group}-${senderGroup.sender}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                {/* Sender Group Info */}
                                                <div className="flex justify-between items-center mb-4 pl-2 pr-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-full bg-white border border-neutral-200/60 shadow-sm flex items-center justify-center text-neutral-400">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[17px] font-bold text-neutral-900 flex items-center gap-2">
                                                                {senderGroup.sender}
                                                            </h3>
                                                            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">발신자 그룹</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-neutral-400">{String(availableMails.length).padStart(2, '0')} 통</span>
                                                        <button
                                                            onClick={() => addAllToBasket(availableMails)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <Inbox size={16} /> 전체 담기
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Emails inside group */}
                                                <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-neutral-100/80 flex flex-col gap-2">
                                                    {availableMails.map((mail: BasketItem) => {
                                                        const isSelected = selectedMails.some(m => m.id === mail.id);
                                                        return (
                                                            <div
                                                                key={mail.id}
                                                                onClick={() => toggleSelection(mail)}
                                                                className={cn(
                                                                    "flex items-center px-4 py-3.5 rounded-2xl transition-all cursor-pointer group/mail border",
                                                                    isSelected
                                                                        ? "bg-emerald-50 shadow-[0_2px_8px_rgba(16,185,129,0.15)] border-emerald-400"
                                                                        : "bg-neutral-50/50 hover:bg-white border-transparent hover:border-neutral-200"
                                                                )}
                                                            >
                                                                {/* 빈 원(호버 시 새 창 링크 아이콘 표시) */}
                                                                <a
                                                                    title="새 창에서 메일 원문 열기"
                                                                    href={`https://mail.google.com/mail/u/0/#all/${mail.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-[22px] h-[22px] rounded-full border flex flex-shrink-0 items-center justify-center mr-4 transition-all z-10 shadow-sm border-neutral-200 bg-white text-neutral-300 hover:border-emerald-500 hover:text-emerald-500"
                                                                >
                                                                    <ExternalLink size={12} strokeWidth={2.5} />
                                                                </a>

                                                                {/* Subject */}
                                                                <div className="flex-1 truncate text-[14px] text-neutral-700 pr-4">
                                                                    {mail.subject}
                                                                </div>

                                                                {/* Add individual to basket (Hover only) */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); addAllToBasket([mail]); }}
                                                                    className="opacity-0 group-hover/mail:opacity-100 focus:opacity-100 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-600 hover:border-emerald-600 rounded-full px-4 py-1.5 text-xs font-bold transition-all ml-4 flex-shrink-0 shadow-sm"
                                                                >
                                                                    담기
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </AnimatePresence>
                    )}

                    {/* Floating Action Bar for selected items */}
                    <AnimatePresence>
                        {selectedMails.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="fixed bottom-8 left-[calc(50%-70px)] -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-white/10 text-white rounded-full pl-8 pr-2 py-2 shadow-2xl flex items-center gap-6 z-50"
                            >
                                <span className="font-semibold text-sm">{selectedMails.length}개 선택됨</span>
                                <button
                                    onClick={addSelectedToBasket}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg flex items-center gap-2 text-[13px]"
                                >
                                    <Inbox size={16} />
                                    바구니에 일괄 추가
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Go to Top Button */}
                    <AnimatePresence>
                        {showTopBtn && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={scrollToTop}
                                className="fixed bottom-8 right-[410px] w-12 h-12 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-emerald-500 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all z-40"
                                title="맨 위로 가기"
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </main>

                {/* RIGHT SIDEBAR (BASKET) */}
                <aside className="w-[380px] flex-shrink-0 p-6 flex flex-col items-center bg-[#FAFAFA] h-full overflow-hidden border-l border-neutral-200/50">
                    <div className="w-full h-full bg-[#1C1C1E] rounded-[2.5rem] p-6 text-white flex flex-col shadow-xl relative overflow-hidden border border-white/5">

                        {/* Basket Header */}
                        <div className="flex items-center justify-between mb-6 mt-2">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#F97415]/20 p-2.5 rounded-2xl text-[#F97415] flex-shrink-0">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-[22px] font-bold flex items-center gap-2 tracking-tight whitespace-nowrap" style={{ color: '#ffffff' }}>
                                        정리 바구니
                                        {basket.length > 0 && <span className="bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ml-1">{basket.length}</span>}
                                    </h2>
                                    <p className="text-[#F97415] text-[10px] uppercase font-bold mt-1 tracking-widest">전체 {basket.length}통</p>
                                </div>
                            </div>
                            {/* 전체 비우기 - 아이콘 버튼 */}
                            <AnimatePresence>
                                {basket.length > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => useBasketStore.getState().clearBasket()}
                                        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30 transition-all flex-shrink-0"
                                        title="바구니 전체 비우기"
                                    >
                                        <X size={14} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* List of groups in basket */}
                        <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-2.5 pr-1 scrollbar-hide">
                            <AnimatePresence>
                                {Object.entries(basketGroups).map(([senderName, items]) => (
                                    <motion.div
                                        key={senderName}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/basketItem overflow-hidden cursor-pointer w-full flex-shrink-0"
                                        onClick={() => toggleGroup(senderName)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/10 p-1.5 rounded-full text-neutral-400">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-[13px] font-bold text-neutral-200">{senderName}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[#F97415] text-[13px] font-black">{String(items.length).padStart(2, '0')}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={cn(
                                                        "text-neutral-500 transition-transform duration-200",
                                                        expandedGroups.includes(senderName) && "rotate-180"
                                                    )}
                                                />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromBasket(senderName); }}
                                                    className="text-neutral-500 hover:text-[#F97415] transition-colors ml-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content for Single Item Deletion */}
                                        <AnimatePresence>
                                            {expandedGroups.includes(senderName) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10 pointer-events-auto"
                                                >
                                                    {items.map(item => (
                                                        <div key={item.id} className="flex flex-row justify-between items-center text-white/70 text-xs px-1 hover:text-white transition-colors">
                                                            <span className="truncate max-w-[200px]">{item.subject || '(제목 없음)'}</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeSingleFromBasket(item.id); }}
                                                                className="text-neutral-500 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {basket.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-10">
                                    <Inbox size={32} className="mb-3 opacity-20" />
                                    <p className="text-sm font-medium">바구니가 비어있습니다</p>
                                    <p className="text-[11px] mt-1 opacity-50">메일을 추가하여 정리를 시작하세요</p>
                                </div>
                            )}
                        </div>

                        {/* 삭제 성공 알림 (absolute를 사용하여 공간을 차지하지 않음) */}
                        <div className="relative w-full h-0 z-50">
                            <AnimatePresence>
                                {trashSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 bg-[#0C1F16] border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-3 rounded-xl shadow-xl pointer-events-none"
                                    >
                                        <CheckCircle2 size={15} /> 성공적으로 처리되었습니다!
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 실패 큐(FailedQueue) */}
                        <AnimatePresence>
                            {failedQueue.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 mb-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-red-400 text-[12px] font-black">⚠ 삭제 실패 {failedQueue.length}통</p>
                                        <button
                                            onClick={handleRetryFailed}
                                            className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-white border border-red-500/40 hover:bg-red-500/30 px-2 py-1 rounded-lg transition-all"
                                        >
                                            <RotateCcw size={11} /> 재시도
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {failedQueue.map(item => (
                                            <p key={item.id} className="text-[11px] text-neutral-400 truncate">{item.subject || '(제목 없음)'}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions Block */}
                        <div className="mt-auto pt-6 border-t border-white/5">
                            <p className="text-[10px] text-neutral-400 mb-3 font-semibold px-1">일괄 작업 설정</p>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {/* 삭제 모드 선택 버튼 - API 호출은 하단 '지금 바로 정리하기' 버튼에서 */}
                                <button
                                    onClick={() => setActionMode('trash')}
                                    disabled={basket.length === 0}
                                    className={cn(
                                        "px-2 py-3 flex items-center justify-center gap-1.5 rounded-[1rem] text-[11px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                        actionMode === 'trash'
                                            ? "bg-[#F97415] text-white shadow-[0_0_20px_rgba(249,116,21,0.2)]"
                                            : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    <Trash2 size={13} />
                                    삭제
                                </button>
                                <button
                                    onClick={() => setActionMode('archive')}
                                    disabled={basket.length === 0}
                                    className={cn(
                                        "px-2 py-3 flex items-center justify-center gap-1.5 rounded-[1rem] text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                        actionMode === 'archive'
                                            ? "bg-[#F97415] text-white shadow-[0_0_20px_rgba(249,116,21,0.2)]"
                                            : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    <Archive size={13} /> 중요
                                </button>
                                <button
                                    onClick={() => setActionMode('star')}
                                    disabled={basket.length === 0}
                                    className={cn(
                                        "px-2 py-3 flex items-center justify-center gap-1.5 rounded-[1rem] text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                        actionMode === 'star'
                                            ? "bg-[#F97415] text-white shadow-[0_0_20px_rgba(249,116,21,0.2)]"
                                            : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    <Star size={13} /> 별표
                                </button>
                            </div>
                            <button
                                onClick={() => setActionMode('label')}
                                disabled={basket.length === 0}
                                className={cn(
                                    "w-full py-3 flex items-center justify-center gap-1.5 rounded-[1rem] text-[11px] font-bold mb-6 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                    actionMode === 'label'
                                        ? "bg-[#F97415] text-white shadow-[0_0_20px_rgba(249,116,21,0.2)]"
                                        : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                )}
                            >
                                <Tag size={13} /> 라벨 추가
                            </button>

                            <div className="flex justify-between items-end mb-3 px-1">
                                <div>
                                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">절감 예측</p>
                                </div>
                                <p className="text-[28px] leading-none font-black text-emerald-500">
                                    {(basket.length * 0.4).toFixed(1)}<span className="text-sm font-bold tracking-tight text-emerald-600">g CO2</span>
                                </p>
                            </div>

                            <div className="mb-6 px-1">
                                <div className="flex justify-between text-[10px] font-bold mb-2">
                                    <span className="text-neutral-400">바구니 용량</span>
                                    <span className="text-white">{basket.length} / {data?.total_count || 128} 통</span>
                                </div>
                                <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((basket.length / (data?.total_count || 128)) * 100, 100)}%` }}
                                        className="h-full bg-[#F97415] rounded-full"
                                    />
                                </div>
                            </div>

                            {/* 모드별 버튼 텍스트·아이콘 동적 렌더링 */}
                            {(() => {
                                const actionConfig = {
                                    trash: { label: '지금 바로 정리하기', icon: <Trash2 size={16} /> },
                                    archive: { label: '중요 편지함으로 이동하기', icon: <Archive size={16} /> },
                                    star: { label: '별표 편지함으로 이동하기', icon: <Star size={16} /> },
                                    label: { label: '편지에 라벨 추가하기', icon: <Tag size={16} /> },
                                } as const;
                                const { label, icon } = actionConfig[actionMode];
                                return (
                                    <button
                                        onClick={handleExecuteAction}
                                        disabled={basket.length === 0 || trashMutation.isPending}
                                        className="w-full bg-[#F97415] hover:bg-[#F97415]/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-[14px] shadow-[0_8px_20px_rgba(249,116,21,0.2)] hover:shadow-[0_8px_25px_rgba(249,116,21,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {trashMutation.isPending ? (
                                            <><Loader2 size={16} className="animate-spin" /> 처리 중...</>
                                        ) : (
                                            <>{label} {icon}</>
                                        )}
                                    </button>
                                );
                            })()}
                            <p className="text-center text-[10px] text-neutral-500 mt-4 font-medium">
                                지금 정리하고 탄소를 절약하세요
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function SidebarBtn({ icon, label, active, onClick, count }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, count?: number }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between w-full px-4 py-[14px] rounded-2xl text-[14px] font-bold transition-all duration-300 relative overflow-hidden",
                active
                    ? "bg-emerald-100/60 text-emerald-700"
                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80"
            )}
        >
            <div className="flex items-center gap-3.5 relative z-10">
                {icon}
                <span>{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full relative z-10", active ? "bg-emerald-500/20 text-emerald-700 font-bold" : "bg-neutral-200/50 text-neutral-500 font-semibold")}>
                    {count}
                </span>
            )}
        </button>
    );
}
