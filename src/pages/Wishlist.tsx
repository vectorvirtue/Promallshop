import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Wishlist.module.css';
import rowStyles from '../components/ProductRow.module.css';
import ProductRow from '../components/ProductRow';
import { productPath } from '../lib/slugs';
import { getImageUrl, productsApi, wishlistApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlistStore } from '../context/WishlistContext';
import { WISHLIST_API_ENABLED } from '../lib/useWishlist';

interface WishlistItem {
  wishlistId: number | string;
  productId: number | string;
  name: string;
  image: string;
  price: string;
  originalPrice: string;
  inStock: boolean;
}

/* the API may nest the product under `product` or flatten it onto the row */
interface RawWishlistRow {
  id?: number | string;
  product_id?: number | string;
  quantity?: number;
  product?: {
    id?: number | string;
    name?: string;
    image?: string;
    price?: string | number;
    end_user_price?: string | number;
    old_price?: string | number;
    discount?: number;
    qty?: number | string;
    availability?: number | string;
  };
  name?: string;
  image?: string;
  price?: string | number;
  end_user_price?: string | number;
  old_price?: string | number;
  qty?: number | string;
  availability?: number | string;
}

const formatPrice = (value: string | number | undefined): string => {
  const n = Number(value ?? 0)
  return n === 0 ? 'Price on request' : n.toLocaleString('en-NG')
}

/* live product data for a wishlist row */
interface LiveProduct {
  inStock: boolean
  price: string
  oldPrice: string
}

interface ApiProduct {
  id: number
  price: string | number
  end_user_price: string | number
  discount?: number
  qty?: number | string
  availability?: number
}

interface ApiCategory {
  category_id: number
  online_discount?: number
  products: ApiProduct[]
}

/**
 * Mirrors the product cards: the current price, plus the struck-through former
 * price derived from the discount percentage.
 */
function toLiveProduct(product: ApiProduct, categoryDiscount: number): LiveProduct {
  const current = Number(product.end_user_price || product.price)
  const discount = categoryDiscount || Number(product.discount ?? 0) || 0
  const former = discount > 0 && current > 0 ? Math.round(current / (1 - discount / 100)) : 0

  return {
    inStock: Number(product.qty ?? 1) > 0 && Number(product.availability ?? 1) !== 0,
    price: formatPrice(current),
    oldPrice: former > 0 ? formatPrice(former) : '',
  }
}

function normalize(rows: RawWishlistRow[]): WishlistItem[] {
  return rows.map(row => {
    const product = row.product ?? (row as RawWishlistRow['product'])
    const currentPrice = Number(product?.end_user_price ?? product?.price ?? 0)
    // prefer the API's former price, else derive it from the discount
    const statedOld = Number(product?.old_price ?? 0)
    const discount = Number(product?.discount ?? 0)
    const derivedOld = discount > 0 && currentPrice > 0
      ? Math.round(currentPrice / (1 - discount / 100))
      : 0
    const oldPrice = statedOld > 0 ? statedOld : derivedOld

    return {
      wishlistId: row.id ?? row.product_id ?? '',
      productId: product?.id ?? row.product_id ?? '',
      name: product?.name ?? row.name ?? 'Product',
      image: getImageUrl(product?.image ?? row.image ?? ''),
      price: formatPrice(currentPrice),
      originalPrice: oldPrice > 0 ? formatPrice(oldPrice) : '',
      inStock: Number(product?.qty ?? 1) > 0 && Number(product?.availability ?? 1) !== 0,
    }
  })
}

/** The wishlist card itself — rendered inside the dashboard tab and on /wishlist */
export const WishlistPanel: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { items: localItems, removeItem: removeLocal } = useWishlistStore();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(WISHLIST_API_ENABLED);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | string | null>(null);
  /* local items store no live price or stock, so read them from the cached
     product list — same source the product cards use for their struck price */
  const [products, setProducts] = useState<Map<string, LiveProduct>>(new Map());

  /* while the API is disabled, the device-local list is the whole story */
  const localOnly = !WISHLIST_API_ENABLED;

  useEffect(() => {
    if (!localOnly) return;
    let cancelled = false;
    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { data?: ApiCategory[] }
        const map = new Map<string, LiveProduct>();
        (r.data ?? []).forEach(category => {
          const categoryDiscount = Number(category.online_discount) || 0
          ;(category.products ?? []).forEach(p => map.set(String(p.id), toLiveProduct(p, categoryDiscount)))
        })
        if (!cancelled) setProducts(map);
      })
      .catch(() => { /* leave it empty — rows fall back to the stored snapshot */ });
    return () => { cancelled = true; };
  }, [localOnly]);

  const loadWishlist = useCallback(async () => {
    if (localOnly || !isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const res = await wishlistApi.get() as { data?: RawWishlistRow[] };
      setItems(normalize(Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Could not load your wishlist.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, localOnly]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const removeItem = async (id: number | string) => {
    if (localOnly) {
      removeLocal(id);
      return;
    }
    setBusyId(id);
    // optimistic — revert if the API rejects it
    const snapshot = items;
    setItems(prev => prev.filter(item => item.wishlistId !== id));
    try {
      await wishlistApi.remove(id);
      toast.success('Removed from wishlist');
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : 'Failed to remove item.');
    } finally {
      setBusyId(null);
    }
  };

  const buyNow = async (item: WishlistItem) => {
    if (localOnly) {
      await addToCart({
        product_id: item.wishlistId,
        name: item.name,
        price: `₦ ${item.price}`,
        img: item.image,
      });
      removeLocal(item.wishlistId);
      toast.success('Moved to cart', { description: item.name });
      navigate('/cart');
      return;
    }
    setBusyId(item.wishlistId);
    try {
      await wishlistApi.moveToCart(item.wishlistId);
      toast.success('Moved to cart', { description: item.name });
      navigate('/cart');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to move item to cart.');
    } finally {
      setBusyId(null);
    }
  };

  /* local mode: map the stored items onto the same view model, preferring the
     live product data so prices and stock stay current */
  const displayItems: WishlistItem[] = localOnly
    ? localItems.map(item => {
        const live = products.get(String(item.product_id))
        return {
          wishlistId: item.product_id,
          productId: item.product_id,
          name: item.name,
          image: item.img,
          price: live ? live.price : item.price.replace(/[^0-9.,]/g, ''),
          originalPrice: live ? live.oldPrice : '',
          // fall back to available when the product is no longer listed at all
          inStock: live ? live.inStock : true,
        }
      })
    : items;

  if (!localOnly && !isAuthenticated) return null;

  return (
    <div className={styles.wishlistCard}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Heart className={styles.heartIcon} size={22} fill="#e67e22" color="#e67e22" />
          <h2 className={styles.title}>Wishlist</h2>
        </div>
        <span className={styles.itemCount}>{loading ? '—' : `${displayItems.length} Items`}</span>
      </div>

      <hr className={styles.divider} />

      {/* Item List Section */}
      {loading ? (
        <p className={styles.message}>Loading your wishlist…</p>
      ) : error ? (
        <>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={loadWishlist}>Try again</button>
        </>
      ) : displayItems.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={40} color="#cbd5e0" />
          <p>Your wishlist is empty.</p>
          <button className={styles.buyNowBtn} onClick={() => navigate('/shop')}>
            BROWSE PRODUCTS
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {displayItems.map((item) => (
            <ProductRow
              key={item.wishlistId}
              image={item.image}
              name={item.name}
              to={productPath(item.name, Number(item.productId))}
              price={item.price ? `₦ ${item.price}` : 'Price on request'}
              oldPrice={item.originalPrice ? `₦ ${item.originalPrice}` : undefined}
              detail={
                <span className={item.inStock ? rowStyles.inStockText : rowStyles.outOfStockText}>
                  {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              }
              actions={
                item.inStock ? (
                  <button
                    className={rowStyles.buyNowBtn}
                    disabled={busyId === item.wishlistId}
                    onClick={() => buyNow(item)}
                  >
                    {busyId === item.wishlistId ? 'MOVING…' : 'BUY NOW'}
                  </button>
                ) : (
                  <button className={rowStyles.outOfStockBtn} disabled>
                    OUT OF STOCK
                  </button>
                )
              }
              onRemove={() => removeItem(item.wishlistId)}
              dimmed={!item.inStock}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPanel;
