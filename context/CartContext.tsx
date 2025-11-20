// context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number; // in cents
  quantity: number;
  size?: string;
  image?: string;
}

export interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'HYDRATE'; payload: CartState }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size?: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
};

const CART_STORAGE_KEY = 'vw_cart'; // Veilnwear cart key

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE': {
      return action.payload;
    }

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size,
      );

      if (existingIndex !== -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingIndex];

        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + action.payload.quantity,
        };

        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.size === action.payload.size
            ),
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items
        .map((item) => {
          if (
            item.productId === action.payload.productId &&
            item.size === action.payload.size
          ) {
            return {
              ...item,
              quantity: action.payload.quantity,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }

    default:
      return state;
  }
}

export interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number; // in cents
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateItemQuantity: (productId: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export interface CartProviderProps {
  children: ReactNode;
}

/**
 * CartProvider – skeleton with:
 * - useReducer-based state
 * - load from localStorage on mount
 * - persist to localStorage on changes
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on first client-side render
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(state);
      window.localStorage.setItem(CART_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [state]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (productId: string, size?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } });
  };

  const updateItemQuantity = (productId: string, size: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextValue = {
    items: state.items,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to access cart context.
 */
export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
