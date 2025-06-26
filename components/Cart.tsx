// components/Cart.tsx
"use client";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
export default function Cart() {
  const { cartOpen, setCartOpen, cartItems, removeFromCart } = useCart();
  const router = useRouter();
  // 💰 **合計金額の計算**
  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  // 🔹 **チェックアウトページへ移動**
  const handleProceedToCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };
  return (
    <Dialog
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      className="relative z-10"
    >
      {/* 背景のオーバーレイ */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 easein-
out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full
pl-10"
          >
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition
duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadowxl">
                {/* ヘッダー */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      ショッピングカート
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-
500"
                      >
                        <span className="sr-only">閉じる</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                  {/* カートの中身 */}
                  <div className="mt-8">
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500 text-center">
                        カートに商品がありません。
                      </p>
                    ) : (
                      <ul
                        role="list"
                        className="-my-6 divide-y divide-gray-200"
                      >
                        {cartItems.map((product) => (
                          <li key={product.id} className="flex py-6">
                            <div
                              className="size-24 shrink-0 overflow-hidden roundedmd
    border border-gray-200"
                            >
                              <img
                                alt={product.title}
                                src={product.imageUrl}
                                className="size-full object-contain"
                              />
                            </div>
                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div
                                  className="flex justify-between text-base fontmedium
    text-gray-900"
                                >
                                  <h3>{product.title}</h3>
                                  <p className="ml-4">¥{product.price}</p>
                                </div>
                              </div>
                              <div
                                className="flex flex-1 items-end justify-between
    text-sm"
                              >
                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(product.id)}
                                    className="font-medium text-indigo-600 hover:textindigo-
    500"
                                  >
                                    削除
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* カートのフッター */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div
                      className="flex justify-between text-base font-medium textgray-
    900"
                    >
                      <p>合計</p>
                      <p>¥{subtotal}</p>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={handleProceedToCheckout}
                        className="btn btn-primary w-full"
                      >
                        購入する
                      </button>
                    </div>
                    <div
                      className="mt-6 flex justify-center text-center text-sm textgray-
500"
                    >
                      <p>
                        <button
                          type="button"
                          onClick={() => setCartOpen(false)}
                          className="font-medium text-indigo-600 hover:text-indigo-
500"
                        >
                          ショッピングを続ける &rarr;
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
