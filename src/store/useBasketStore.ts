import { create } from 'zustand';

interface BasketItem {
    id: string;
    sender: string;
    subject: string;
    category?: string;
}

interface BasketState {
    basket: BasketItem[];
    addAll: (items: BasketItem[]) => void;
    removeBySender: (sender: string) => void;
    removeById: (id: string) => void;
    clearBasket: () => void;
    restoreItems: (items: BasketItem[]) => void;
}

export const useBasketStore = create<BasketState>((set) => ({
    basket: [],

    // 중복 제거 후 추가
    addAll: (items) =>
        set((state) => ({
            basket: [
                ...state.basket,
                ...items.filter((item) => !state.basket.some((b) => b.id === item.id)),
            ],
        })),

    // 발신자 기준으로 그룹 전체 삭제
    removeBySender: (sender) =>
        set((state) => ({
            basket: state.basket.filter((item) => item.sender !== sender),
        })),

    // 개별 메일 ID로 삭제
    removeById: (id) =>
        set((state) => ({
            basket: state.basket.filter((item) => item.id !== id),
        })),

    // 바구니 전체 비우기
    clearBasket: () => set({ basket: [] }),

    // 롤백용 (낙관적 UI 실패 시 복원)
    restoreItems: (items) =>
        set((state) => ({
            basket: [...state.basket, ...items],
        })),
}));
