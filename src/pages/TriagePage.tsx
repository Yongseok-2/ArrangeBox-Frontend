import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Inbox, Star, AlertCircle, Mail, HelpCircle, Tag, Zap, Loader2, User, Trash2, Archive, X, ExternalLink, ArrowUp, ChevronDown, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiClient } from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useBasketStore } from '@/store/useBasketStore';

interface BasketItem {
    id: string;
    sender: string;
    subject: string;
    category?: string; // 카테고리 별 보기 대응
    date?: string;
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


const tabLabelMap: Record<string, string> = {
    'all': '전체',
    'unread': '안 읽은',
    'read': '읽은',
    'important': '중요',
    'starred': '별표 표시된',
    'label': '라벨 지정된',
};

// 카테고리 한글 라벨 맵
const categoryLabelMap: Record<string, string> = {
    work_action: '업무 / 액션',
    finance_billing: '금융 / 청구',
    account_security: '계정 / 보안',
    shopping_delivery: '쇼핑 / 배송',
    newsletter_promo: '뉴스레터 / 프로모션',
    social_community: '소셜 / 커뮤니티',
    personal: '개인',
    other: '기타',
};

// 날짜 포맷 헬퍼 (예: 25.12.03)
const formatMailDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
};

// 기간 기준 필터 헬퍼 (오래된 메일 기준)
const checkDateFilter = (isoString: string | undefined, filter: string) => {
    if (filter === 'all') return true;
    if (!isoString) return false;
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return true;
    const diffDays = (Date.now() - time) / (1000 * 60 * 60 * 24);
    if (filter === '1m') return diffDays >= 30;
    if (filter === '3m') return diffDays >= 90;
    if (filter === '6m') return diffDays >= 180;
    if (filter === '1y') return diffDays >= 365;
    return true;
};

export default function TriagePage() {
    const [activeTab, setActiveTab] = useState('all');
    const [dateFilter, setDateFilter] = useState<'all' | '1m' | '3m' | '6m' | '1y'>('all');
    const [selectedMails, setSelectedMails] = useState<BasketItem[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [expandedMainGroups, setExpandedMainGroups] = useState<string[]>([]);
    const [failedQueue, setFailedQueue] = useState<BasketItem[]>([]);
    const [trashSuccess, setTrashSuccess] = useState(false);
    const [actionError, setActionError] = useState(false); // API 에러 알림
    // 선택 액션 Set: 'trash' | 'add:IMPORTANT' | 'add:STARRED' | 'add:label' | 'remove:IMPORTANT' | 'remove:STARRED' | 'remove:label'
    const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set(['trash']));
    const [executedIds, setExecutedIds] = useState<Set<string>>(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [viewMode, setViewMode] = useState<'sender' | 'category'>('sender');
    const accountId = useAuthStore((state) => state.accountId);
    const queryClient = useQueryClient(); // 뮣테이션 성공 후 쿼리 무효화용

    // 메칭 메인 그룹 토글 함수
    const toggleMainGroup = (groupId: string) => {
        setExpandedMainGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

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
        queryKey: ['triage-preview-db', accountId],
        queryFn: async () => {
            const response = await apiClient.post('/emails/triage/preview-db', {
                account_id: accountId,  // 필수: 계정별 데이터 조회
                max_unread: 1000,
                max_read: 1000,
            });
            return response.data;
        },
        enabled: !!accountId,
    });

    const buckets = data?.buckets || [];

    // 1. 모든 버킷에서 유니크한 메일 정보 추출하여 전역 마스터 리스트 생성
    const allMailsMap = new Map<string, any>();
    const bucketIdSets: Record<string, Set<string>> = {};

    buckets.forEach((b: any) => {
        const idsInThisBucket = new Set<string>();
        b.label_groups?.forEach((lg: any) => {
            lg.senders?.forEach((sg: any) => {
                sg.categories?.forEach((cat: any) => {
                    cat.message_ids?.forEach((id: string, idx: number) => {
                        idsInThisBucket.add(id);
                        if (!allMailsMap.has(id)) {
                            allMailsMap.set(id, {
                                id,
                                sender: sg.sender,
                                subject: cat.sample_subjects?.[idx] || '',
                                date: cat.message_dates?.[idx],
                                category: cat.category || 'other'
                            });
                        }
                    });
                });
            });
        });
        bucketIdSets[b.bucket] = idsInThisBucket;
    });

    const masterMails = Array.from(allMailsMap.values());

    // 2. 현재 선택된 탭에 실시간으로 필터링된 메일 리스트 생성
    const currentTabMails = activeTab === 'all'
        ? masterMails.filter(m => bucketIdSets['unread']?.has(m.id) || bucketIdSets['read']?.has(m.id))
        : masterMails.filter(m => bucketIdSets[activeTab]?.has(m.id));

    // 3. 기존 UI 구조(label_groups)에 맞게 데이터 재구성
    const rebuildDisplayItems = (mails: any[]) => {
        if (mails.length === 0) return [];
        const senderMap = new Map<string, any>();
        mails.forEach(m => {
            let sg = senderMap.get(m.sender);
            if (!sg) {
                sg = { sender: m.sender, count: 0, categories: [] };
                senderMap.set(m.sender, sg);
            }
            let cat = sg.categories.find((c: any) => c.category === m.category);
            if (!cat) {
                cat = { category: m.category, count: 0, message_ids: [], sample_subjects: [], message_dates: [] };
                sg.categories.push(cat);
            }
            cat.message_ids.push(m.id);
            cat.sample_subjects.push(m.subject);
            cat.message_dates.push(m.date);
            cat.count++;
            sg.count++;
        });

        return [{
            label_group: 'normal',
            count: mails.length,
            senders: Array.from(senderMap.values())
        }];
    };

    const displayItems = rebuildDisplayItems(currentTabMails);

    // '전체' 탭인 경우, 서버의 total_count가 중복(안 읽음+별표 등)을 포함할 수 있으므로 
    // ID 기준으로 중복이 제거된 데이터의 개수를 우선 사용합니다.
    const unreadCount = buckets.find((b: any) => b.bucket === 'unread')?.count || 0;
    const readCount = buckets.find((b: any) => b.bucket === 'read')?.count || 0;
    const serverTotalUnique = unreadCount + readCount;

    // 실제 표시되는 마스터 리스트 리스트의 개수 (안 읽음 + 읽은 고유 ID 기준)
    const allUniqueCount = masterMails.filter(m => bucketIdSets['unread']?.has(m.id) || bucketIdSets['read']?.has(m.id)).length;

    const currentBucketCount = activeTab === 'all'
        ? (serverTotalUnique || allUniqueCount)
        : currentTabMails.length;

    // ------- 주요 라벨(중요, 별표) ID 추출 -------
    const importantIds = new Set<string>();
    const starredIds = new Set<string>();
    buckets.forEach((b: any) => {
        if (b.bucket === 'important') {
            b.label_groups?.forEach((lg: any) => lg.senders?.forEach((sg: any) => sg.categories?.forEach((cat: any) => cat.message_ids?.forEach((id: string) => importantIds.add(id)))));
        }
        if (b.bucket === 'starred') {
            b.label_groups?.forEach((lg: any) => lg.senders?.forEach((sg: any) => sg.categories?.forEach((cat: any) => cat.message_ids?.forEach((id: string) => starredIds.add(id)))));
        }
    });

    // ------- 카테고리 뷰용 데이터 변환 -------
    const categoryGroups: Record<string, BasketItem[]> = {};
    currentTabMails.forEach((mail: any) => {
        const id = mail.id;
        const date = mail.date;
        const label = mail.category || 'other';

        if (!basket.some(b => b.id === id) && !executedIds.has(id) && checkDateFilter(date, dateFilter)) {
            if (!categoryGroups[label]) categoryGroups[label] = [];
            categoryGroups[label].push({
                id,
                subject: mail.subject,
                sender: mail.sender,
                category: label,
                date
            });
        }
    });
    const categoryEntries = Object.entries(categoryGroups).filter(([, mails]) => mails.length > 0);

    const toggleSelection = (item: BasketItem) => {
        setSelectedMails(prev =>
            prev.some(m => m.id === item.id) ? prev.filter(m => m.id !== item.id) : [...prev, item]
        );
    };

    const addAllToBasket = (items: BasketItem[]) => {
        addAll(items);  // store action으로 중복 제거 후 추가
        setSelectedMails(prev => prev.filter(sm => !items.some(newItem => newItem.id === sm.id)));
    };

    // 현재 탭 + 기간 필터 기준 모든 메일을 바구니에 담기
    const addAllCurrentTabToBasket = () => {
        const allItems: BasketItem[] = [];
        currentTabMails.forEach((mail: any) => {
            const id = mail.id;
            const date = mail.date;
            if (!basket.some(b => b.id === id) && !executedIds.has(id) && checkDateFilter(date, dateFilter)) {
                allItems.push({
                    id,
                    subject: mail.subject,
                    sender: mail.sender,
                    category: mail.category || 'other',
                    date
                });
            }
        });
        addAllToBasket(allItems);
    };

    const addSelectedToBasket = () => {
        addAllToBasket(selectedMails);
    };

    const removeFromBasketGroup = (groupName: string) => {
        if (viewMode === 'sender') {
            removeBySender(groupName);
        } else {
            // 카테고리 모드일 때 해당 카테고리 항목 전체 삭제
            const targets = basket.filter(b => (b.category || 'other') === groupName);
            targets.forEach(t => removeById(t.id));
        }
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
                // 실제 서버 상태 동기화 - 로컴 DB가 반영되로록 쿼리 재요청
                queryClient.invalidateQueries({ queryKey: ['triage-preview-db'] });
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
            // 에러 알림 3초
            setActionError(true);
            setTimeout(() => setActionError(false), 3000);
        },
    });

    // 중요/별표/라벨: POST /emails/labels API 뮤테이션
    const labelMutation = useMutation({
        mutationFn: ({ ids, addLabels, removeLabels }: { ids: string[]; addLabels: string[]; removeLabels?: string[] }) =>
            executeLabelAction({ account_id: accountId || '', message_ids: ids, add_label_ids: addLabels, remove_label_ids: removeLabels || [] }),
        onMutate: async ({ ids, addLabels, removeLabels }) => {
            const actingItems = basket.filter(item => ids.includes(item.id));

            // 바구니에서만 제거 (중앙 목록에는 남김)
            ids.forEach(id => removeById(id));

            // 진행 중인 쿼리 취소 후 이전 상태 저장
            await queryClient.cancelQueries({ queryKey: ['triage-preview-db', accountId] });
            const previousData = queryClient.getQueryData(['triage-preview-db', accountId]);

            // 낙관적 UI: Query Cache 데이터 즉시 반영
            if (previousData) {
                queryClient.setQueryData(['triage-preview-db', accountId], (oldData: any) => {
                    const newData = JSON.parse(JSON.stringify(oldData));

                    // ── 라벨 추가: 해당 bucket에 메일 삽입 ──────────────────────────
                    const addToBucket = (bucketName: string) => {
                        let bucket = newData.buckets.find((b: any) => b.bucket === bucketName);
                        if (!bucket) {
                            bucket = { bucket: bucketName, count: 0, label_groups: [] };
                            newData.buckets.push(bucket);
                        }

                        actingItems.forEach(item => {
                            let lg = bucket.label_groups.find((l: any) => l.label_group === 'normal');
                            if (!lg) {
                                lg = { label_group: 'normal', count: 0, senders: [] };
                                bucket.label_groups.push(lg);
                            }

                            let sender = lg.senders.find((s: any) => s.sender === item.sender);
                            if (!sender) {
                                sender = { sender: item.sender, count: 0, categories: [] };
                                lg.senders.push(sender);
                            }

                            let category = sender.categories.find((c: any) => c.category === (item.category || 'other'));
                            if (!category) {
                                category = { category: item.category || 'other', count: 0, message_ids: [], sample_subjects: [] };
                                sender.categories.push(category);
                            }

                            if (!category.message_ids?.includes(item.id)) {
                                category.message_ids = category.message_ids || [];
                                category.message_ids.push(item.id);
                                category.sample_subjects = category.sample_subjects || [];
                                category.sample_subjects.push(item.subject);
                                category.count++;
                                sender.count++;
                                lg.count++;
                                bucket.count++;
                            }
                        });
                    };

                    // ── 라벨 제거: 해당 bucket에서 메일 삭제 ──────────────────────────
                    // remove:IMPORTANT → important 버킷에서 해당 메일 ID 삭제
                    // remove:STARRED   → starred  버킷에서 해당 메일 ID 삭제
                    const removeFromBucket = (bucketName: string) => {
                        const bucket = newData.buckets.find((b: any) => b.bucket === bucketName);
                        if (!bucket) return;
                        bucket.label_groups?.forEach((lg: any) => {
                            lg.senders?.forEach((sg: any) => {
                                sg.categories?.forEach((cat: any) => {
                                    const idxArr: number[] = [];
                                    (cat.message_ids || []).forEach((mid: string, i: number) => {
                                        if (ids.includes(mid)) idxArr.push(i);
                                    });
                                    // 뒤에서부터 제거해야 인덱스 밀림 없음
                                    idxArr.reverse().forEach(i => {
                                        cat.message_ids.splice(i, 1);
                                        cat.sample_subjects?.splice(i, 1);
                                        cat.count = Math.max(0, (cat.count || 1) - 1);
                                    });
                                });
                                // 빈 category 제거
                                sg.categories = sg.categories.filter((cat: any) => (cat.message_ids?.length || 0) > 0);
                            });
                            // 빈 sender 제거
                            lg.senders = lg.senders.filter((sg: any) => (sg.categories?.length || 0) > 0);
                        });
                        // 빈 label_group 제거
                        bucket.label_groups = bucket.label_groups.filter((lg: any) => (lg.senders?.length || 0) > 0);
                    };

                    if (addLabels?.includes('IMPORTANT')) addToBucket('important');
                    if (addLabels?.includes('STARRED')) addToBucket('starred');
                    if (removeLabels?.includes('IMPORTANT')) removeFromBucket('important');
                    if (removeLabels?.includes('STARRED')) removeFromBucket('starred');

                    return newData;
                });
            }

            return { actingItems, previousData };
        },
        onSuccess: (result, _vars, context) => {
            if (result?.partial_failed && result.failed_ids?.length > 0) {
                // 일부 실패: 실패한 메일만 바구니에 복원
                const failedItems = (context?.actingItems || []).filter(
                    item => result.failed_ids.includes(item.id)
                );
                restoreItems(failedItems);

                // 일부 성공한 메일은 유지 → 성공 알림 표시
                const successCount = (context?.actingItems?.length || 0) - failedItems.length;
                if (successCount > 0) {
                    setTrashSuccess(true);
                    setTimeout(() => setTrashSuccess(false), 3000);
                }
                setActionError(true);
                setTimeout(() => setActionError(false), 3000);
            } else {
                // 전체 성공 → 알림 표시
                // ⚠️ invalidateQueries 즉시 호출 시 서버가 라벨을 아직 반영하기 전에
                //    재조회가 일어나 낙관적 업데이트가 덮어씌워지는 버그 발생.
                //    3초 뒤에 실제 서버 데이터로 동기화한다.
                setTrashSuccess(true);
                setTimeout(() => setTrashSuccess(false), 3000);
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['triage-preview-db'] });
                }, 3000);
            }
        },
        onError: (_err, _vars, context) => {
            if (context?.actingItems) restoreItems(context.actingItems);
            if (context?.previousData) {
                queryClient.setQueryData(['triage-preview-db', accountId], context.previousData);
            }
            // 에러 알림 3초
            setActionError(true);
            setTimeout(() => setActionError(false), 3000);
        },
    });

    // 액션 토글 - 충돌 규칙 적용
    const toggleAction = (action: string) => {
        setSelectedActions(prev => {
            const next = new Set(prev);

            // 삭제(trash) 선택 시 다른 모든 라벨 해제 및 토글
            if (action === 'trash') {
                if (next.has('trash')) {
                    next.delete('trash');
                } else {
                    next.clear();
                    next.add('trash');
                }
                return next;
            }

            const isAdd = action.startsWith('add:');
            const isRemove = action.startsWith('remove:');

            if (next.has(action)) {
                next.delete(action);
            } else {
                // 삭제 모드 해제 후 라벨 액션 추가
                next.delete('trash');

                // 충돌 방지: 추가 그룹과 제거 그룹은 동시에 선택 불가
                if (isAdd) Array.from(next).forEach(a => { if (a.startsWith('remove:')) next.delete(a); });
                if (isRemove) Array.from(next).forEach(a => { if (a.startsWith('add:')) next.delete(a); });

                next.add(action);
            }
            return next;
        });
    };

    // 선택된 액션 도우미 값
    const isTrashMode = selectedActions.has('trash');
    const hasAddActions = Array.from(selectedActions).some(a => a.startsWith('add:'));
    const hasRemoveActions = Array.from(selectedActions).some(a => a.startsWith('remove:'));

    // 실행 버튼 클릭 → 모달 오픈
    const handleExecuteAction = () => {
        if (basket.length === 0 || trashMutation.isPending || labelMutation.isPending) return;
        setShowConfirmModal(true);
    };

    // 모달 확인 → selectedActions에 따라 올바른 API로 라우팅
    const confirmAndExecute = () => {
        setShowConfirmModal(false);
        const ids = basket.map(item => item.id);
        if (isTrashMode) {
            trashMutation.mutate({ ids, action: 'trash' });
        } else {
            const addLabels: string[] = [];
            const removeLabels: string[] = [];
            if (selectedActions.has('add:IMPORTANT')) addLabels.push('IMPORTANT');
            if (selectedActions.has('add:STARRED')) addLabels.push('STARRED');
            if (selectedActions.has('remove:IMPORTANT')) removeLabels.push('IMPORTANT');
            if (selectedActions.has('remove:STARRED')) removeLabels.push('STARRED');
            labelMutation.mutate({ ids, addLabels, removeLabels });
        }
    };

    // failedQueue 재시도
    const handleRetryFailed = () => {
        if (failedQueue.length === 0) return;
        const ids = failedQueue.map(item => item.id);
        setFailedQueue([]);
        trashMutation.mutate({ ids, action: 'trash' });
    };

    const basketGroups = basket.reduce((acc, item) => {
        const groupKey = viewMode === 'sender' ? item.sender : (item.category || 'other');
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(item);
        return acc;
    }, {} as Record<string, BasketItem[]>);

    // 확인 모달 config - selectedActions 기반 동적 생성
    const getConfirmConfig = () => {
        if (isTrashMode) {
            return { title: '정말 삭제하시겠습니까?', desc: `선택한 ${basket.length}통의 메일을 Gmail 휴지통으로 이동합니다.`, color: 'red' as const, icon: <Trash2 size={22} /> };
        }
        if (hasAddActions) {
            const tags: string[] = [];
            if (selectedActions.has('add:IMPORTANT')) tags.push('중요');
            if (selectedActions.has('add:STARRED')) tags.push('별표');
            return { title: `${tags.join(' + ')} 표시를 추가할까요?`, desc: `선택한 ${basket.length}통에 ${tags.join(', ')} 라벨을 추가합니다.`, color: 'amber' as const, icon: <AlertCircle size={22} /> };
        }
        if (hasRemoveActions) {
            const tags: string[] = [];
            if (selectedActions.has('remove:IMPORTANT')) tags.push('중요');
            if (selectedActions.has('remove:STARRED')) tags.push('별표');
            return { title: `${tags.join(' + ')} 표시를 제거할까요?`, desc: `선택한 ${basket.length}통에서 ${tags.join(', ')} 라벨을 제거합니다.`, color: 'yellow' as const, icon: <X size={22} /> };
        }
        return { title: '작업을 실행할까요?', desc: `선택한 ${basket.length}통의 메일에 의요.`, color: 'emerald' as const, icon: <Tag size={22} /> };
    };

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-[#FAFAFA] font-sans overflow-hidden">

            {/* ===== 확인 모달 ===== */}
            <AnimatePresence>
                {showConfirmModal && (() => {
                    const cfg = getConfirmConfig();
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
                        <SidebarBtn icon={<Inbox size={18} />} label="전체" active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setSelectedMails([]); }} count={allUniqueCount} />
                        <SidebarBtn icon={<Mail size={18} />} label="안 읽음" active={activeTab === 'unread'} onClick={() => { setActiveTab('unread'); setSelectedMails([]); }} count={bucketIdSets['unread']?.size || 0} />
                        <SidebarBtn icon={<CheckCircle2 size={18} />} label="읽음" active={activeTab === 'read'} onClick={() => { setActiveTab('read'); setSelectedMails([]); }} count={bucketIdSets['read']?.size || 0} />
                        <SidebarBtn icon={<AlertCircle size={18} />} label="중요" active={activeTab === 'important'} onClick={() => { setActiveTab('important'); setSelectedMails([]); }} count={bucketIdSets['important']?.size || 0} />
                        <SidebarBtn icon={<Star size={18} />} label="별표" active={activeTab === 'starred'} onClick={() => { setActiveTab('starred'); setSelectedMails([]); }} count={bucketIdSets['starred']?.size || 0} />
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
                        </div>

                        <div className="bg-emerald-50 rounded-[2rem] px-8 py-3.5 flex flex-col items-end relative overflow-hidden shadow-sm">
                            <span className="text-[10px] font-bold text-emerald-600 mb-0.5 z-10 w-full text-left">성장 지표</span>
                            <div className="flex items-center gap-2 z-10">
                                <span className="text-3xl font-black text-emerald-600 tracking-tight">{((serverTotalUnique || allUniqueCount) * 0.4).toFixed(1)}<span className="text-lg tracking-normal font-bold">g CO2</span></span>
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <Leaf size={14} />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl z-0"></div>
                        </div>
                    </div>

                    {/* -------- 행1: 보기 모드 & 탭 전체 담기 -------- */}
                    <div className="flex justify-between items-center w-full max-w-4xl mb-3">
                        {/* 보기 모드 */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mr-2">보기 모드</span>
                            <button
                                onClick={() => setViewMode('sender')}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold transition-all border",
                                    viewMode === 'sender'
                                        ? "bg-neutral-900 text-white border-transparent shadow-sm"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                                )}
                            >
                                <User size={13} /> 발신자 별로 보기
                            </button>
                            <button
                                onClick={() => setViewMode('category')}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold transition-all border",
                                    viewMode === 'category'
                                        ? "bg-neutral-900 text-white border-transparent shadow-sm"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                                )}
                            >
                                <Tag size={13} /> 카테고리 별로 보기
                            </button>
                        </div>

                        {/* 탭 전체 담기 */}
                        {!isLoading && !isError && displayItems.length > 0 && (
                            <div className="flex items-center gap-3">
                                <p className="text-[12px] text-neutral-400">
                                    현재 탭의 메일을 한 번에 바구니에 담습니다.
                                    {dateFilter !== 'all' && <span className="text-emerald-600 font-bold ml-1">(기간 필터 적용 중)</span>}
                                </p>
                                <button
                                    onClick={addAllCurrentTabToBasket}
                                    className="flex items-center gap-2 bg-neutral-900 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-[12px] font-bold transition-all shadow-sm flex-shrink-0"
                                >
                                    <Inbox size={14} />
                                    {tabLabelMap[activeTab] || '현재 탭'} 메일 전체 담기
                                </button>
                            </div>
                        )}
                    </div>

                    {/* -------- 행2: 총 메일 개수 & 기간 필터 -------- */}
                    <div className="flex justify-between items-center w-full max-w-4xl mb-6">
                        {/* 총 메일 개수 (+ 필터 기준 개수) */}
                        <div className="flex items-center gap-3">
                            <p className="text-neutral-500 text-[13px]">
                                총 <strong className="text-neutral-900">{currentBucketCount}개</strong>의 {tabLabelMap[activeTab] || '메시지'} 메일
                            </p>
                            {(() => {
                                if (dateFilter === 'all') return null;
                                const filteredIds = new Set<string>();
                                displayItems.forEach((group: any) => {
                                    group.senders.forEach((senderGroup: any) => {
                                        senderGroup.categories.forEach((cat: any) => {
                                            cat.sample_subjects.forEach((_: string, idx: number) => {
                                                const id = cat.message_ids?.[idx] || `${senderGroup.sender}-${idx}`;
                                                const date = cat.message_dates?.[idx];
                                                if (!basket.some(b => b.id === id) && !executedIds.has(id) && checkDateFilter(date, dateFilter)) {
                                                    filteredIds.add(id);
                                                }
                                            });
                                        });
                                    });
                                });
                                return (
                                    <span className="text-neutral-400 text-[13px]">
                                        · 필터 기준 <strong className="text-neutral-600">{filteredIds.size}개</strong> 표시 중
                                    </span>
                                );
                            })()}
                        </div>

                        {/* 기간 필터 */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mr-2">기간 필터</span>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                                className="bg-white border border-neutral-200 text-neutral-600 text-[12px] font-bold px-3 py-1.5 rounded-full outline-none hover:border-neutral-300 focus:border-emerald-500 transition-colors shadow-sm cursor-pointer"
                            >
                                <option value="all">전체 기간</option>
                                <option value="1m">1개월 지난 메일</option>
                                <option value="3m">3개월 지난 메일</option>
                                <option value="6m">6개월 지난 메일</option>
                                <option value="1y">1년 지난 메일</option>
                            </select>
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

                                {/* ======== 발신자 별 보기 ======== */}
                                {viewMode === 'sender' && displayItems.map((group: any) =>
                                    group.senders.map((senderGroup: any, i: number) => {
                                        const availableMails = senderGroup.categories.flatMap((cat: any) =>
                                            cat.sample_subjects.map((subject: string, idx: number) => ({
                                                subject,
                                                id: cat.message_ids?.[idx] || `${senderGroup.sender}-${idx}`,
                                                date: cat.message_dates?.[idx],
                                                sender: senderGroup.sender,
                                                category: cat.category || 'other'
                                            }))
                                        ).filter((m: any) =>
                                            !basket.some(b => b.id === m.id) &&
                                            !executedIds.has(m.id) &&
                                            checkDateFilter(m.date, dateFilter)
                                        );
                                        if (availableMails.length === 0) return null;
                                        const isExpanded = expandedMainGroups.includes(senderGroup.sender);

                                        return (
                                            <motion.div
                                                key={`${group.label_group}-${senderGroup.sender}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                {/* Sender Group Info (Header) */}
                                                <div
                                                    onClick={() => toggleMainGroup(senderGroup.sender)}
                                                    className="flex justify-between items-center mb-1 pl-2 pr-4 bg-white/60 hover:bg-white p-4 rounded-[2rem] border border-neutral-200/50 hover:border-emerald-200/60 transition-all cursor-pointer group/header shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-full bg-white border border-neutral-200/60 shadow-sm flex items-center justify-center text-neutral-400 group-hover/header:text-emerald-500 transition-colors">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[17px] font-bold text-neutral-900 flex items-center gap-2">
                                                                {senderGroup.sender}
                                                                <ChevronDown
                                                                    size={16}
                                                                    className={cn("text-neutral-300 transition-transform duration-300", isExpanded && "rotate-180 text-emerald-500")}
                                                                />
                                                            </h3>
                                                            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">발신자 그룹</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-neutral-400">{String(availableMails.length).padStart(2, '0')} 통</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addAllToBasket(availableMails); }}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <Inbox size={16} /> 전체 담기
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Emails inside sender group */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="overflow-hidden mt-3"
                                                        >
                                                            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-200/60 flex flex-col gap-2">
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
                                                                            <a
                                                                                title="새 창에서 메일 원문 열기"
                                                                                href={`https://mail.google.com/mail/u/0/#all/${mail.id}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="w-[22px] h-[22px] rounded-full border flex flex-shrink-0 items-center justify-center mr-3 transition-all z-10 shadow-sm border-neutral-200 bg-white text-neutral-300 hover:border-emerald-500 hover:text-emerald-500"
                                                                            >
                                                                                <ExternalLink size={12} strokeWidth={2.5} />
                                                                            </a>
                                                                            {/* 라벨 아이콘 (중요 / 별표) */}
                                                                            {(importantIds.has(mail.id) || starredIds.has(mail.id)) && (
                                                                                <div className="flex gap-1 mr-3 flex-shrink-0 mt-0.5">
                                                                                    {importantIds.has(mail.id) && <span title="중요"><AlertCircle size={14} className="text-amber-500" /></span>}
                                                                                    {starredIds.has(mail.id) && <span title="별표"><Star size={14} className="text-yellow-400 fill-yellow-400" /></span>}
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1 truncate text-[14px] text-neutral-700 pr-4">{mail.subject}</div>
                                                                            {mail.date && <span className="text-[11px] text-neutral-400 font-medium flex-shrink-0 tracking-wider tabular-nums">{formatMailDate(mail.date)}</span>}
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); addAllToBasket([mail]); }}
                                                                                className="opacity-0 group-hover/mail:opacity-100 focus:opacity-100 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-600 hover:border-emerald-600 rounded-full px-4 py-1.5 text-xs font-bold transition-all ml-4 flex-shrink-0 shadow-sm"
                                                                            >
                                                                                담기
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })
                                )}

                                {/* ======== 카테고리 별 보기 ======== */}
                                {viewMode === 'category' && categoryEntries.map(([category, mails], i) => {
                                    const isExpanded = expandedMainGroups.includes(category);

                                    return (
                                        <motion.div
                                            key={`cat-${category}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                        >
                                            {/* Category Group Header */}
                                            <div
                                                onClick={() => toggleMainGroup(category)}
                                                className="flex justify-between items-center mb-1 pl-2 pr-4 bg-white/60 hover:bg-white p-4 rounded-[2rem] border border-neutral-200/50 hover:border-emerald-200/60 transition-all cursor-pointer group/header shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-700 shadow-sm flex items-center justify-center text-white">
                                                        <Tag size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[17px] font-bold text-neutral-900 flex items-center gap-2">
                                                            {categoryLabelMap[category] || category}
                                                            <ChevronDown
                                                                size={16}
                                                                className={cn("text-neutral-300 transition-transform duration-300", isExpanded && "rotate-180 text-emerald-500")}
                                                            />
                                                        </h3>
                                                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">카테고리 그룹</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-bold text-neutral-400">{String(mails.length).padStart(2, '0')} 통</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); addAllToBasket(mails); }}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                                                    >
                                                        <Inbox size={16} /> 전체 담기
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Emails inside category group */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="overflow-hidden mt-3"
                                                    >
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-200/60 flex flex-col gap-2">
                                                            {mails.map((mail: BasketItem) => {
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
                                                                        <a
                                                                            title="새 창에서 메일 원문 열기"
                                                                            href={`https://mail.google.com/mail/u/0/#all/${mail.id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-[22px] h-[22px] rounded-full border flex flex-shrink-0 items-center justify-center mr-3 transition-all z-10 shadow-sm border-neutral-200 bg-white text-neutral-300 hover:border-emerald-500 hover:text-emerald-500"
                                                                        >
                                                                            <ExternalLink size={12} strokeWidth={2.5} />
                                                                        </a>
                                                                        {/* 라벨 아이콘 (중요 / 별표) */}
                                                                        {(importantIds.has(mail.id) || starredIds.has(mail.id)) && (
                                                                            <div className="flex gap-1 mr-3 flex-shrink-0 mt-0.5">
                                                                                {importantIds.has(mail.id) && <span title="중요"><Archive size={14} className="text-amber-500" /></span>}
                                                                                {starredIds.has(mail.id) && <span title="별표"><Star size={14} className="text-yellow-400 fill-yellow-400" /></span>}
                                                                            </div>
                                                                        )}
                                                                        {/* 메일 제목 */}
                                                                        <div className="flex-1 truncate text-[14px] text-neutral-700 pr-3">{mail.subject}</div>
                                                                        {/* 날짜 */}
                                                                        {mail.date && <span className="text-[11px] text-neutral-400 font-medium flex-shrink-0 tracking-wider tabular-nums mr-2">{formatMailDate(mail.date)}</span>}
                                                                        {/* 발신자 (카테고리 뷰에서만 표시) */}
                                                                        <span className="text-[11px] text-neutral-400 font-medium flex-shrink-0 mr-3 hidden sm:block truncate max-w-[120px]">{mail.sender}</span>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); addAllToBasket([mail]); }}
                                                                            className="opacity-0 group-hover/mail:opacity-100 focus:opacity-100 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-600 hover:border-emerald-600 rounded-full px-4 py-1.5 text-xs font-bold transition-all flex-shrink-0 shadow-sm"
                                                                        >
                                                                            담기
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}

                                {/* 카테고리 뷰에서 아무것도 없을 때 */}
                                {viewMode === 'category' && categoryEntries.length === 0 && !isLoading && (
                                    <div className="flex flex-col items-center justify-center p-20 text-center">
                                        <Inbox className="w-16 h-16 text-neutral-300 mb-4" />
                                        <h3 className="text-xl font-bold text-neutral-900 mb-2">지구가 조금 더 푸르러졌어요!</h3>
                                        <p className="text-neutral-500">이 그룹의 모든 이메일 정리를 마쳤습니다.</p>
                                    </div>
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
                        <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2.5 pr-1 scrollbar-hide">
                            <AnimatePresence>
                                {Object.entries(basketGroups).map(([groupName, items]) => (
                                    <motion.div
                                        key={groupName}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/basketItem overflow-hidden cursor-pointer w-full flex-shrink-0"
                                        onClick={() => toggleGroup(groupName)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/10 p-1.5 rounded-full text-neutral-400">
                                                    {viewMode === 'sender' ? <User size={14} /> : <Tag size={14} />}
                                                </div>
                                                <span className="text-[13px] font-bold text-neutral-200">
                                                    {viewMode === 'sender' ? groupName : (categoryLabelMap[groupName] || groupName)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[#F97415] text-[13px] font-black">{String(items.length).padStart(2, '0')}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={cn(
                                                        "text-neutral-500 transition-transform duration-200",
                                                        expandedGroups.includes(groupName) && "rotate-180"
                                                    )}
                                                />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromBasketGroup(groupName); }}
                                                    className="text-neutral-500 hover:text-[#F97415] transition-colors ml-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content for Single Item Deletion */}
                                        <AnimatePresence>
                                            {expandedGroups.includes(groupName) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10 pointer-events-auto"
                                                >
                                                    {items.map(item => (
                                                        <div key={item.id} className="flex flex-row justify-between items-center text-white/70 text-xs px-1 hover:text-white transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                                {/* 중요/별표 아이콘 (바구니 내부에도 표시) */}
                                                                <div className="flex gap-0.5 flex-shrink-0">
                                                                    {importantIds.has(item.id) && <AlertCircle size={10} className="text-amber-500" />}
                                                                    {starredIds.has(item.id) && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                                                                </div>
                                                                <span className="truncate flex-1">{item.subject || '(제목 없음)'}</span>
                                                            </div>
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

                        {/* 성공 / 에러 알림 (absolute - 공간 차지 안 함) */}
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
                            <AnimatePresence>
                                {actionError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 bg-[#1F0C0C] border border-red-500/30 text-red-400 text-[12px] font-bold px-4 py-3 rounded-xl shadow-xl pointer-events-none"
                                    >
                                        <X size={15} /> 오류가 발생했습니다
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

                            {/* 삭제 - 단독 전용 */}
                            <button
                                onClick={() => toggleAction('trash')}
                                className={cn(
                                    "w-full mb-3 py-2.5 flex items-center justify-center gap-1.5 rounded-[1rem] text-[11px] font-black transition-all",
                                    isTrashMode
                                        ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                                        : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                )}
                            >
                                <Trash2 size={13} /> 삭제
                            </button>

                            {/* 라벨 추가 그룹 */}
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 px-1">라벨 추가</p>
                            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                                {[
                                    { key: 'add:IMPORTANT', icon: <AlertCircle size={12} />, label: '중요' },
                                    { key: 'add:STARRED', icon: <Star size={12} />, label: '별표' },
                                    // { key: 'add:label',     icon: <Tag size={12} />,     label: '라벨' },
                                ].filter(item => !item.key.endsWith(':label')).map(({ key, icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleAction(key)}
                                        className={cn(
                                            "py-2 flex items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                                            selectedActions.has(key)
                                                ? "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                                : (hasRemoveActions || isTrashMode)
                                                    ? "bg-white/5 text-neutral-600"
                                                    : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                        )}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>

                            {/* 라벨 제거 그룹 */}
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 px-1">라벨 제거</p>
                            <div className="grid grid-cols-2 gap-1.5 mb-5">
                                {[
                                    { key: 'remove:IMPORTANT', icon: <AlertCircle size={12} />, label: '중요 ×' },
                                    { key: 'remove:STARRED', icon: <Star size={12} />, label: '별표 ×' },
                                    // { key: 'remove:label',     icon: <Tag size={12} />,     label: '라벨 ×' },
                                ].filter(item => !item.key.endsWith(':label')).map(({ key, icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleAction(key)}
                                        className={cn(
                                            "py-2 flex items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                                            selectedActions.has(key)
                                                ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                                                : (hasAddActions || isTrashMode)
                                                    ? "bg-white/5 text-neutral-600"
                                                    : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                                        )}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-end mb-6 px-1">
                                <div>
                                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">절감 예측</p>
                                </div>
                                <p className="text-[28px] leading-none font-black text-emerald-500">
                                    {(basket.length * 0.4).toFixed(1)}<span className="text-sm font-bold tracking-tight text-emerald-600">g CO2</span>
                                </p>
                            </div>

                            {/* 모드별 버튼 텍스트·아이콘 동적 렌더링 */}
                            {(() => {
                                let btnLabel = '지금 바로 정리하기';
                                let btnIcon = <Trash2 size={16} />;
                                if (hasAddActions) {
                                    const tags: string[] = [];
                                    if (selectedActions.has('add:IMPORTANT')) tags.push('중요');
                                    if (selectedActions.has('add:STARRED')) tags.push('별표');
                                    btnLabel = tags.length > 0 ? `${tags.join(' + ')} 추가하기` : '라벨 추가하기';
                                    btnIcon = <AlertCircle size={16} />;
                                } else if (hasRemoveActions) {
                                    const tags: string[] = [];
                                    if (selectedActions.has('remove:IMPORTANT')) tags.push('중요');
                                    if (selectedActions.has('remove:STARRED')) tags.push('별표');
                                    btnLabel = tags.length > 0 ? `${tags.join(' + ')} 제거하기` : '라벨 제거하기';
                                    btnIcon = <X size={16} />;
                                }
                                return (
                                    <button
                                        onClick={handleExecuteAction}
                                        disabled={basket.length === 0 || trashMutation.isPending || labelMutation.isPending}
                                        className="w-full bg-[#F97415] hover:bg-[#F97415]/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-[14px] shadow-[0_8px_20px_rgba(249,116,21,0.2)] hover:shadow-[0_8px_25px_rgba(249,116,21,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {(trashMutation.isPending || labelMutation.isPending) ? (
                                            <><Loader2 size={16} className="animate-spin" /> 처리 중...</>
                                        ) : (
                                            <>{btnLabel} {btnIcon}</>
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
