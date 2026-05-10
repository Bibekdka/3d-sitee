import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  variant?: string;
  finish?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
}

/**
 * Manages the shopping cart state with local storage persistence.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      /**
       * Adds an item to the cart or increments quantity if it already exists.
       */
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === newItem.id && i.variant === newItem.variant && i.finish === newItem.finish);
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === newItem.id && i.variant === newItem.variant && i.finish === newItem.finish
                ? { ...i, qty: i.qty + newItem.qty }
                : i
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      
      /**
       * Removes an item from the cart.
       */
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      
      /**
       * Updates the quantity of a specific item.
       */
      updateQty: (id, qty) => {
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        });
      },
      
      /**
       * Clears all items from the cart.
       */
      clearCart: () => set({ items: [] }),
      
      /**
       * Computed total value of items in the cart.
       */
      get total() {
        return get().items.reduce((acc, item) => acc + item.price * item.qty, 0);
      },
    }),
    {
      name: 'genesis-cart-storage',
    }
  )
);
