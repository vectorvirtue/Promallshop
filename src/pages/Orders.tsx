import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Orders.module.css';
import { ordersApi, orderItemsApi, productsApi, getImageUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/* ── API shapes ── */

/* GET /orders/my-orders — an invoice header only, no product data */
interface ApiOrder {
  id: number;
  bill_no: string;
  status: string;
  date_time: string;
  gross_amount: string;
  net_amount: string;
  discount: string;
  paid_status: number;
}

/* GET /order-items — product_id only, and store-wide, so it must be filtered */
interface ApiOrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  qty: number;
  rate: string;
  amount: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  date: string;
  status: string;
  discount: string;  // calculated discount amount for display
  total: string;
  /* struck-through pre-discount price, empty when the product isn't discounted */
  formerTotal: string;
  actionStatus: string;
}

const toNumber = (value: string | number | undefined) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

const formatAmount = (value: number) => value.toLocaleString('en-NG');

/** product lookups repeat across orders, so resolve each id once */
const productCache = new Map<string, { name: string; image: string; discount: number }>();

async function resolveProducts(ids: number[]) {
  const unique = [...new Set(ids)].filter(id => !productCache.has(String(id)));

  await Promise.all(
    unique.map(async id => {
      try {
        const res = await productsApi.getOne(id) as { data?: { name?: string; image?: string; discount?: number } };
        /* the API returns a relative path, so resolve it to a full URL */
        productCache.set(String(id), {
          name: res?.data?.name ?? '',
          image: res?.data?.image ? getImageUrl(res.data.image) : '',
          /* discount is a percentage off, matching the product cards */
          discount: toNumber(res?.data?.discount),
        });
      } catch {
        productCache.set(String(id), { name: '', image: '', discount: 0 });
      }
    })
  );
}

/**
 * One row per order line item so the thumbnail and name are real. Orders with no
 * line items (older orders, or ones placed before items were recorded) fall back
 * to a single row showing the bill number.
 */
function toRows(
  orders: ApiOrder[],
  itemsByOrder: Map<number, ApiOrderItem[]>
): OrderItem[] {
  return orders.flatMap(order => {
    const gross = toNumber(order.gross_amount);
    const actionStatus = order.paid_status === 1 || String(order.status).toLowerCase() === 'paid' ? 'Paid' : 'Unpaid';

    const items = itemsByOrder.get(order.id) ?? [];

    /* no line items recorded — fall back to a single row for the whole invoice */
    if (items.length === 0) {
      const saved = toNumber(order.discount) || Math.max(0, gross - toNumber(order.net_amount));
      return [{
        id: String(order.id),
        name: order.bill_no || `Order #${order.id}`,
        image: '',
        date: formatDate(order.date_time),
        status: order.status || 'Pending',
        discount: saved > 0 ? formatAmount(saved) : '0',
        total: formatAmount(gross),
        formerTotal: saved > 0 ? formatAmount(gross + saved) : '',
        actionStatus,
      }];
    }

    return items.map((item, index) => {
      const product = productCache.get(String(item.product_id));
      const qty = toNumber(item.qty) || 1;
      const lineAmount = toNumber(item.amount);
      const unit = lineAmount / qty;

      /* the amount charged already has the markdown applied, so the pre-discount
         price is recovered the same way the product cards do it */
      const percent = product?.discount ?? 0;
      const formerUnit = percent > 0 && percent < 100 && unit > 0
        ? unit / (1 - percent / 100)
        : 0;
      
      const discountAmount = formerUnit > 0 ? Math.round((formerUnit * qty) - lineAmount) : 0;

      return {
        id: `${order.id}-${item.id ?? index}`,
        name: product?.name || `Product #${item.product_id}`,
        image: product?.image ?? '',
        date: formatDate(order.date_time),
        status: order.status || 'Pending',
        discount: discountAmount > 0 ? formatAmount(discountAmount) : '0',
        total: formatAmount(lineAmount),
        formerTotal: formerUnit > 0 ? formatAmount(Math.round(formerUnit * qty)) : '',
        actionStatus,
      };
    });
  });
}

export const Orders: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const res = await ordersApi.getAll() as { data?: ApiOrder[] };
      const orders = Array.isArray(res.data) ? res.data : [];

      /* order items are a separate resource and are NOT user-scoped, so keep
         only the rows belonging to this user's own order ids */
      const itemsByOrder = new Map<number, ApiOrderItem[]>();
      try {
        const itemsRes = await orderItemsApi.getAll() as { data?: ApiOrderItem[] };
        const myOrderIds = new Set(orders.map(order => order.id));

        for (const item of itemsRes?.data ?? []) {
          if (!myOrderIds.has(item.order_id)) continue;
          const list = itemsByOrder.get(item.order_id) ?? [];
          list.push(item);
          itemsByOrder.set(item.order_id, list);
        }

        await resolveProducts([...itemsByOrder.values()].flat().map(item => item.product_id));
      } catch {
        /* line items are supplementary — fall back to the invoice header */
      }

      setOrders(toRows(orders, itemsByOrder));
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.ordersCard}>
      {/* Top Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Orders</h2>
        <Link to="/track-order" className={styles.trackLink}>
          Track my order
        </Link>
      </div>

      <hr className={styles.divider} />

      {loading ? (
        <p className={styles.message}>Loading your orders…</p>
      ) : error ? (
        <>
          <p className={styles.message}>{error}</p>
          <button className={styles.retryBtn} onClick={loadOrders}>Try again</button>
        </>
      ) : orders.length === 0 ? (
        <p className={styles.message}>You have not placed any orders yet.</p>
      ) : (
        <>
          {/* Table Headers */}
          <div className={styles.tableHeader}>
            <div className={styles.colOrder}>Order</div>
            <div className={styles.colDate}>Date</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colDiscount}>Discount</div>
            <div className={styles.colTotal}>Total</div>
            <div className={styles.colActions}>Actions</div>
          </div>

          {/* Orders List */}
          <div className={styles.orderList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderRow}>
                {/* Order Item Details */}
                <div className={styles.colOrder}>
                  <div className={styles.productInfo}>
                    <div className={styles.imageWrapper}>
                      {order.image && <img src={order.image} alt={order.name} className={styles.productImage} />}
                    </div>
                    <span className={styles.productName}>{order.name}</span>
                  </div>
                </div>

                {/* Date */}
                <div className={styles.colDate}>
                  <span className={styles.cellText}>{order.date}</span>
                </div>

                {/* Status */}
                <div className={styles.colStatus}>
                  <span className={styles.cellText}>{order.status}</span>
                </div>

                {/* Discount */}
                <div className={styles.colDiscount}>
                  <span className={styles.discountText}>
                    <span className={styles.currency}>₦</span> {order.discount}
                  </span>
                </div>

                {/* Total */}
                <div className={styles.colTotal}>
                  <span className={styles.totalText}>
                    <span className={styles.currency}>₦</span> {order.total}
                  </span>
                </div>

                {/* Actions */}
                <div className={styles.colActions}>
                  <span className={styles.cellText}>{order.actionStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
