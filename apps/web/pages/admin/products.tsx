import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBoxesStacked, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../components/AuthCheck";
import Metatags from "../../components/Metatags";
import { supaClient } from "../../supa-client";
import { Button, ChipGroup, Field, Notice, Panel, Pill, inputClass } from "../../components/booking/admin/ui";
import { formatEuro } from "../../lib/orders";
import {
  FieldError,
  MAX_DESCRIPTION,
  MAX_NAME,
  MAX_PRICE,
  MAX_STOCK,
  ProductDraft,
  isLowStock,
  stockLevel,
  validateDraft,
} from "../../lib/product/edit";

// e.g. localhost:3000/admin/products?filter=low
// Admins change product names, prices and stock here (admin_update_product,
// migration 20261015170000; stock is saved as a change). Stock also goes down
// with each paid order (save_order_items) and back up on a full refund, and
// the admin gets an email when a sale takes a product to its low-stock level.

const m = defineMessages({
  title: { id: "products-admin-title", description: "Products admin page heading", defaultMessage: "Products" },
  subtitle: {
    id: "products-admin-subtitle",
    description: "Products admin page subtitle",
    defaultMessage: "Prices and stock for the shop. Stock goes down with each sale, and you get an email when a product runs low.",
  },
  back: { id: "products-admin-back", description: "Link back to the admin page", defaultMessage: "Admin" },
  add: { id: "products-admin-add", description: "Link to the form that adds a product, on the shop page", defaultMessage: "Add a product" },
  notAdmin: { id: "products-admin-not-admin", description: "Products admin: shown to non-admins", defaultMessage: "Only admins can manage products." },
  loadFailed: {
    id: "products-admin-load-failed",
    description: "Products admin: products could not be loaded",
    defaultMessage: "Products couldn't be loaded ({error}). If this is the first time, the products migration may not have been run yet.",
  },
  retry: { id: "products-admin-retry", description: "Products admin: try loading again", defaultMessage: "Try again" },
  summary: {
    id: "products-admin-summary",
    description: "Products admin: number of products and how many are low on stock",
    defaultMessage: "{count, plural, one {# product} other {# products}} · {low, plural, =0 {none low on stock} other {# low on stock}}",
  },
  search: { id: "products-admin-search", description: "Products admin: search box label", defaultMessage: "Search products" },
  filter: { id: "products-admin-filter", description: "Products admin: label of the filter chips", defaultMessage: "Show" },
  filterAll: { id: "products-admin-filter-all", description: "Products admin filter: every product", defaultMessage: "All" },
  filterLow: { id: "products-admin-filter-low", description: "Products admin filter: low on stock or sold out", defaultMessage: "Low on stock" },
  none: { id: "products-admin-none", description: "Products admin: no product matches the search or filter", defaultMessage: "No products match." },
  noneLow: { id: "products-admin-none-low", description: "Products admin: nothing is low on stock", defaultMessage: "Nothing is low on stock." },
  soldOut: { id: "products-admin-sold-out", description: "Products admin pill: stock is 0", defaultMessage: "Sold out" },
  low: { id: "products-admin-low", description: "Products admin pill: stock at or below the low-stock level", defaultMessage: "{count} left" },
  inStock: { id: "products-admin-in-stock", description: "Products admin pill: stock is fine", defaultMessage: "{count} in stock" },
  edit: { id: "products-admin-edit", description: "Products admin: open the edit form", defaultMessage: "Edit" },
  editFor: { id: "products-admin-edit-for", description: "Products admin: screen reader label of the edit button", defaultMessage: "Edit {name}" },
  name: { id: "products-admin-name", description: "Products admin field: product name", defaultMessage: "Name" },
  description: { id: "products-admin-description", description: "Products admin field: product description", defaultMessage: "Description" },
  price: { id: "products-admin-price", description: "Products admin field: price in euros", defaultMessage: "Price (€)" },
  stock: { id: "products-admin-stock", description: "Products admin field: number in stock", defaultMessage: "In stock" },
  lowStock: { id: "products-admin-low-stock", description: "Products admin field: low-stock email level", defaultMessage: "Low-stock email at" },
  lowStockHint: {
    id: "products-admin-low-stock-hint",
    description: "Products admin: explains the low-stock level",
    defaultMessage: "You get an email when a sale takes stock to this number or below. 0 means only when it sells out.",
  },
  less: { id: "products-admin-stock-less", description: "Products admin: lower stock by one", defaultMessage: "Remove one from stock" },
  more: { id: "products-admin-stock-more", description: "Products admin: raise stock by one", defaultMessage: "Add one to stock" },
  save: { id: "products-admin-save", description: "Products admin: save the changes", defaultMessage: "Save" },
  saving: { id: "products-admin-saving", description: "Products admin: the save is running", defaultMessage: "Saving…" },
  cancel: { id: "products-admin-cancel", description: "Products admin: close the form without saving", defaultMessage: "Cancel" },
  saved: { id: "products-admin-saved", description: "Products admin: the changes were saved", defaultMessage: "Saved {name}." },
  saveFailed: { id: "products-admin-save-failed", description: "Products admin: saving failed", defaultMessage: "Saving failed ({error}). Please try again." },
  stockBelowZero: {
    id: "products-admin-stock-below-zero",
    description: "Products admin: the stock change would go below 0 because of sales while the form was open",
    defaultMessage: "That would take stock below 0: some sold while you were editing. Close the form, open it again and check the number.",
  },
  gone: { id: "products-admin-gone", description: "Products admin: the product was deleted meanwhile", defaultMessage: "This product no longer exists." },
  errRequired: { id: "products-admin-err-required", description: "Products admin field error: empty", defaultMessage: "Required." },
  errNameLong: { id: "products-admin-err-name-long", description: "Products admin field error: name too long", defaultMessage: "At most {max} characters." },
  errPriceFormat: {
    id: "products-admin-err-price-format",
    description: "Products admin field error: price not a number",
    defaultMessage: "Use a number like 19 or 19.90.",
  },
  errPriceLow: { id: "products-admin-err-price-low", description: "Products admin field error: price is 0", defaultMessage: "The price must be more than 0." },
  errPriceHigh: { id: "products-admin-err-price-high", description: "Products admin field error: price too high", defaultMessage: "At most {max}." },
  errCountFormat: { id: "products-admin-err-count-format", description: "Products admin field error: not a whole number", defaultMessage: "Use a whole number, 0 or more." },
  errCountHigh: { id: "products-admin-err-count-high", description: "Products admin field error: number too high", defaultMessage: "At most {max}." },
});

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
  image_url: string | null;
}

const PRODUCT_COLUMNS = "id, name, description, price, stock, low_stock_threshold, image_url";

type Filter = "all" | "low";

const AdminProducts: NextPage = () => {
  const intl = useIntl();
  return (
    <>
      <Metatags title={intl.formatMessage(m.title)} />
      <div className="booking-ui font-poppins [&_button]:font-poppins [&_input]:font-poppins [&_textarea]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AuthCheck>
            <AdminOnly />
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function AdminOnly() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supaClient.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
  }, []);
  if (isAdmin === null) return <ListSkeleton />;
  if (!isAdmin) return <Panel>{intl.formatMessage(m.notAdmin)}</Panel>;
  return <ProductsAdmin />;
}

function ProductsAdmin() {
  const intl = useIntl();
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const filter: Filter = router.query.filter === "low" ? "low" : "all";
  const setFilter = (next: Filter) =>
    router.replace({ pathname: router.pathname, query: next === "all" ? {} : { filter: next } }, undefined, { shallow: true, scroll: false });

  const load = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await supaClient.from("products").select(PRODUCT_COLUMNS).order("name");
    if (error) {
      console.error("Loading products failed", error);
      setLoadError(error.message);
      return;
    }
    setProducts((data ?? []) as ProductRow[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const replaceProduct = (row: ProductRow) =>
    setProducts((list) => (list ?? []).map((p) => (p.id === row.id ? row : p)));
  const removeProduct = (id: string) => setProducts((list) => (list ?? []).filter((p) => p.id !== id));

  const lowCount = useMemo(
    () => (products ?? []).filter(isLowStock).length,
    [products]
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const list = (products ?? []).filter(
      (p) =>
        (filter === "all" || isLowStock(p)) &&
        (!needle || p.name.toLocaleLowerCase().includes(needle) || (p.description ?? "").toLocaleLowerCase().includes(needle))
    );
    // Low on stock: the emptiest first
    return filter === "low" ? [...list].sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name)) : list;
  }, [products, query, filter]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
          {intl.formatMessage(m.back)}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faBoxesStacked} className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title)}</h1>
              <p className="text-sm text-[var(--text-muted)] max-w-xl">{intl.formatMessage(m.subtitle)}</p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,var(--bg-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--text-primary)]"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" aria-hidden="true" />
            {intl.formatMessage(m.add)}
          </Link>
        </div>
      </header>

      {loadError ? (
        <Panel>
          <div className="flex flex-col gap-3 items-start">
            <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error: loadError })}</Notice>
            <Button onClick={load}>{intl.formatMessage(m.retry)}</Button>
          </div>
        </Panel>
      ) : products === null ? (
        <ListSkeleton />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold flex-1 min-w-0">
              {intl.formatMessage(m.search)}
              <input
                type="search"
                className={inputClass}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <ChipGroup<Filter>
              label={intl.formatMessage(m.filter)}
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: intl.formatMessage(m.filterAll) },
                { value: "low", label: `${intl.formatMessage(m.filterLow)} (${lowCount})` },
              ]}
            />
          </div>

          <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
            {intl.formatMessage(m.summary, { count: products.length, low: lowCount })}
          </p>

          {savedName && <Notice tone="success">{intl.formatMessage(m.saved, { name: savedName })}</Notice>}

          {shown.length === 0 ? (
            <Panel>
              <p className="text-sm">{intl.formatMessage(filter === "low" && !query.trim() ? m.noneLow : m.none)}</p>
            </Panel>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((product) => (
                <li key={product.id}>
                  <ProductItem
                    product={product}
                    editing={editingId === product.id}
                    onEdit={() => {
                      setSavedName(null);
                      setEditingId(product.id);
                    }}
                    onClose={() => setEditingId(null)}
                    onSaved={(row) => {
                      replaceProduct(row);
                      setEditingId(null);
                      setSavedName(row.name);
                    }}
                    onGone={() => {
                      removeProduct(product.id);
                      setEditingId(null);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function StockPill({ product }: { product: ProductRow }) {
  const intl = useIntl();
  const level = stockLevel(product.stock, product.low_stock_threshold);
  if (level === "out") return <Pill tone="danger">{intl.formatMessage(m.soldOut)}</Pill>;
  if (level === "low") return <Pill tone="warning">{intl.formatMessage(m.low, { count: product.stock })}</Pill>;
  return <Pill tone="muted">{intl.formatMessage(m.inStock, { count: product.stock })}</Pill>;
}

function ProductItem({
  product,
  editing,
  onEdit,
  onClose,
  onSaved,
  onGone,
}: {
  product: ProductRow;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSaved: (row: ProductRow) => void;
  onGone: () => void;
}) {
  const intl = useIntl();
  return (
    <article
      className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-4"
      aria-label={product.name}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="w-14 h-14 shrink-0 rounded-lg object-cover bg-[var(--surface-inset)]"
          />
        ) : (
          <span className="w-14 h-14 shrink-0 rounded-lg bg-[var(--surface-inset)]" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold break-words">{product.name}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
            <span className="tabular-nums">{formatEuro(intl, product.price)}</span>
            <StockPill product={product} />
          </div>
        </div>
        {!editing && (
          <Button onClick={onEdit} aria-label={intl.formatMessage(m.editFor, { name: product.name })}>
            {intl.formatMessage(m.edit)}
          </Button>
        )}
      </div>
      {editing && <EditForm product={product} onClose={onClose} onSaved={onSaved} onGone={onGone} />}
    </article>
  );
}

const toDraft = (p: ProductRow): ProductDraft => ({
  name: p.name,
  description: p.description ?? "",
  price: String(p.price),
  stock: String(p.stock),
  lowStock: String(p.low_stock_threshold),
});

function EditForm({
  product,
  onClose,
  onSaved,
  onGone,
}: {
  product: ProductRow;
  onClose: () => void;
  onSaved: (row: ProductRow) => void;
  onGone: () => void;
}) {
  const intl = useIntl();
  const id = useId();
  const [draft, setDraft] = useState<ProductDraft>(() => toDraft(product));
  const [errors, setErrors] = useState<Partial<Record<keyof ProductDraft, FieldError>>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof ProductDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [field]: e.target.value }));

  const stepStock = (delta: number) =>
    setDraft((d) => {
      const current = /^\d+$/.test(d.stock.trim()) ? Number(d.stock.trim()) : product.stock;
      return { ...d, stock: String(Math.min(MAX_STOCK, Math.max(0, current + delta))) };
    });

  const errorText = (field: keyof ProductDraft): string | null => {
    const error = errors[field];
    if (!error) return null;
    if (error === "required") return intl.formatMessage(m.errRequired);
    if (error === "too_long") return intl.formatMessage(m.errNameLong, { max: field === "name" ? MAX_NAME : MAX_DESCRIPTION });
    if (field === "price") {
      if (error === "too_low") return intl.formatMessage(m.errPriceLow);
      if (error === "too_high") return intl.formatMessage(m.errPriceHigh, { max: formatEuro(intl, MAX_PRICE) });
      return intl.formatMessage(m.errPriceFormat);
    }
    if (error === "too_high") return intl.formatMessage(m.errCountHigh, { max: intl.formatNumber(MAX_STOCK) });
    return intl.formatMessage(m.errCountFormat);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFailure(null);
    const checked = validateDraft(draft);
    if ("errors" in checked) {
      setErrors(checked.errors);
      // Focus the first field with a problem
      const first = (["name", "description", "price", "stock", "lowStock"] as const).find((f) => checked.errors[f]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setErrors({});
    setSaving(true);
    // Stock is saved as a change from what the form opened with, so a sale
    // between opening and saving is kept rather than overwritten
    const { changes } = checked;
    const { data, error } = await supaClient.rpc("admin_update_product", {
      p_product_id: product.id,
      p_name: changes.name,
      p_description: changes.description,
      p_price: changes.price,
      p_low_stock_threshold: changes.low_stock_threshold,
      p_stock_change: changes.stock - product.stock,
    });
    setSaving(false);
    if (error) {
      // 23514: the change would take stock below 0 (sales took more meanwhile)
      setFailure(error.code === "23514" ? intl.formatMessage(m.stockBelowZero) : intl.formatMessage(m.saveFailed, { error: error.message }));
      return;
    }
    const row = (data as ProductRow[] | null)?.[0];
    if (!row) {
      setFailure(intl.formatMessage(m.gone));
      setTimeout(onGone, 2500);
      return;
    }
    onSaved(row);
  };

  // A labelled input with its id, error line and aria wiring
  const field = (name: keyof ProductDraft, label: string, input: (props: Record<string, unknown>) => React.ReactNode, hint?: string) => (
    <div className="flex flex-col gap-1">
      <Field label={label} htmlFor={`${id}-${name}`} hint={hint}>
        {input({
          id: `${id}-${name}`,
          value: draft[name],
          onChange: set(name),
          autoComplete: "off",
          "aria-invalid": errors[name] ? true : undefined,
          "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
        })}
      </Field>
      {errors[name] && (
        <p id={`${id}-${name}-error`} className="text-xs font-medium text-[var(--status-danger)]">
          {errorText(name)}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={save} noValidate className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {field("name", intl.formatMessage(m.name), (props) => <input {...props} className={inputClass} maxLength={MAX_NAME + 20} />)}
        </div>
        <div className="sm:col-span-2">
          {field("description", intl.formatMessage(m.description), (props) => (
            <textarea {...props} className={`${inputClass} min-h-[88px]`} rows={3} />
          ))}
        </div>
        {field("price", intl.formatMessage(m.price), (props) => <input {...props} className={inputClass} inputMode="decimal" />)}
        {field("stock", intl.formatMessage(m.stock), (props) => (
          <div className="flex gap-2">
            <Button onClick={() => stepStock(-1)} aria-label={intl.formatMessage(m.less)} className="w-11 shrink-0 px-0">
              <FontAwesomeIcon icon={faMinus} className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
            <input {...props} className={`${inputClass} text-center tabular-nums`} inputMode="numeric" />
            <Button onClick={() => stepStock(1)} aria-label={intl.formatMessage(m.more)} className="w-11 shrink-0 px-0">
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        ))}
        <div className="sm:col-span-2 sm:max-w-xs">
          {field(
            "lowStock",
            intl.formatMessage(m.lowStock),
            (props) => <input {...props} className={`${inputClass} tabular-nums`} inputMode="numeric" />,
            intl.formatMessage(m.lowStockHint)
          )}
        </div>
      </div>

      {failure && <Notice tone="danger">{failure}</Notice>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {intl.formatMessage(saving ? m.saving : m.save)}
        </Button>
        <Button onClick={onClose} disabled={saving}>
          {intl.formatMessage(m.cancel)}
        </Button>
      </div>
    </form>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-lg bg-[var(--surface-inset)]" />
          <div className="flex-1">
            <div className="h-4 w-40 rounded bg-[var(--surface-inset)] mb-2" />
            <div className="h-3 w-24 rounded bg-[var(--surface-inset)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminProducts;
