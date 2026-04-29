import { useState } from "react";
import { useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useCart } from "~/components/providers/cart-provider";
import { useAuth } from "~/components/providers/auth-provider";
import { useAction } from "~/hooks/use-action";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { getSessionUser } from "~/lib/auth/session.server";
import { serverRedirect } from "~/lib/router/server-responses.server";
import { submitOrderDefinition } from "~/lib/actions/submit-order/action-definition";

export { action_handler as action } from "~/lib/actions/_core/action-runner.server";

export function meta() {
  return [{ title: "Checkout — Minashow" }];
}

// ─── Loader: require auth ────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) throw serverRedirect({ rawAbsolutePath: "/login?redirectTo=/checkout" });
  return {};
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CheckoutFormState {
  name: string;
  organization: string;
  email: string;
  phone: string;
  shippingAddress: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutFormState>({
    name: user?.name ?? "",
    organization: "",
    email: user?.email ?? "",
    phone: "",
    shippingAddress: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormState>>({});

  const { submit, isValidating } = useAction(submitOrderDefinition, {
    onSuccess: (data) => {
      clearCart();
      navigate(`/confirmation?orderId=${data.orderId}`);
    },
    toastOnError: {
      message: "Failed to place order. Please try again.",
    },
  });

  if (items.length === 0) {
    navigate("/shop");
    return null;
  }

  const validate = (): Partial<CheckoutFormState> => {
    const e: Partial<CheckoutFormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.organization.trim()) e.organization = "Organization name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  };

  const handleChange = (field: keyof CheckoutFormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    submit({
      customerName: form.name,
      customerOrganization: form.organization,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingAddress: form.shippingAddress || undefined,
      notes: form.notes || undefined,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      })),
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-gray-900 mb-8"
          style={{ fontFamily: "Fredoka, sans-serif", fontSize: "2rem", fontWeight: 700 }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2
                className="text-gray-900 mb-5"
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                }}
              >
                Your details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="font-sans font-bold text-gray-700 mb-1.5 block">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Mary Hanna"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${
                      errors.name ? "border-red-300" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
                  )}
                </div>

                {/* Organization */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="organization"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Organization name
                  </Label>
                  <Input
                    id="organization"
                    type="text"
                    value={form.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    placeholder="e.g. Sunrise Community Center"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${
                      errors.organization ? "border-red-300" : ""
                    }`}
                  />
                  {errors.organization && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.organization}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@organization.org"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${
                      errors.email ? "border-red-300" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label
                    htmlFor="phone"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${
                      errors.phone ? "border-red-300" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone}</p>
                  )}
                </div>

                {/* Shipping address */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="shippingAddress"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Shipping address{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="shippingAddress"
                    value={form.shippingAddress}
                    onChange={(e) => handleChange("shippingAddress", e.target.value)}
                    placeholder="Street address, city, province/state, postal code, country"
                    rows={2}
                    className="rounded-xl bg-gray-50 border-gray-200 font-sans resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="notes"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Notes{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any special requests or questions..."
                    rows={3}
                    className="rounded-xl bg-gray-50 border-gray-200 font-sans resize-none"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isValidating}
              variant="primary-filled"
              className="w-full rounded-full py-3.5 font-sans font-extrabold"
            >
              {isValidating ? "Placing order…" : "Place order"}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2
                className="text-gray-900 mb-4"
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                }}
              >
                Order summary
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm truncate font-sans font-bold">
                        {item.name}
                      </p>
                      <p className="text-gray-400 text-xs font-sans">Qty {item.quantity}</p>
                    </div>
                    <span className="text-gray-800 text-sm shrink-0 font-sans font-bold">
                      ${item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-sans font-bold">Total</span>
                  <span
                    className="text-gray-900"
                    style={{
                      fontFamily: "Fredoka, sans-serif",
                      fontWeight: 600,
                      fontSize: "1.25rem",
                    }}
                  >
                    ${total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
