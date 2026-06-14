import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { requireCustomer } from "~/lib/auth/admin.server";
import { countryNames, regionsForCountry } from "~/lib/geo/countries";
import { submitOrderDefinition } from "~/lib/actions/submit-order/action-definition";

export { action_handler as action } from "~/lib/actions/_core/action-runner.server";

export function meta() {
  return [{ title: "Checkout — Minashow" }];
}

// ─── Loader: customer-only ───────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  await requireCustomer(request);
  return {};
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CheckoutFormState {
  name: string;
  organization: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
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
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
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

  // Redirect away from checkout if the cart is empty — but skip while a
  // submission is in flight, otherwise the post-submit clearCart() races with
  // navigate("/confirmation") and we end up on /shop instead.
  useEffect(() => {
    if (items.length === 0 && !isValidating) {
      navigate("/shop");
    }
  }, [items.length, isValidating, navigate]);

  if (items.length === 0 && !isValidating) {
    return null;
  }

  const validate = (): Partial<CheckoutFormState> => {
    const e: Partial<CheckoutFormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.organization.trim()) e.organization = "Organization name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.country.trim()) e.country = "Country is required";
    // Province is required only when the chosen country has subdivisions in the
    // dataset; countries without them fall back to an optional free-text input.
    if (regionsForCountry(form.country).length > 0 && !form.province.trim()) {
      e.province = "Province/State is required";
    }
    if (!form.postalCode.trim()) e.postalCode = "Postal code is required";
    return e;
  };

  const handleChange = (field: keyof CheckoutFormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Changing country invalidates the previously selected province, so reset it.
  const handleCountryChange = (country: string) => {
    setForm((f) => ({ ...f, country, province: "" }));
    setErrors((e) => ({ ...e, country: undefined, province: undefined }));
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
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      country: form.country,
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

  // Subdivisions for the chosen country. Empty → no dataset entries, so the
  // province field falls back to free text.
  const provinceRegions = regionsForCountry(form.country);

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
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.name ? "border-red-300" : ""
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
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.organization ? "border-red-300" : ""
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
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.email ? "border-red-300" : ""
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
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.phone ? "border-red-300" : ""
                      }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone}</p>
                  )}
                </div>

                {/* Address line 1 */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="addressLine1"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Address line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={form.addressLine1}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    placeholder="e.g. 123 Main St"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.addressLine1 ? "border-red-300" : ""
                      }`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.addressLine1}</p>
                  )}
                </div>

                {/* Address line 2 */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="addressLine2"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Address line 2{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={form.addressLine2}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    placeholder="Apt, suite, unit, etc."
                    className="rounded-xl bg-gray-50 border-gray-200 font-sans"
                  />
                </div>

                {/* Country — picked first so it can drive the province options */}
                <div>
                  <Label
                    htmlFor="country"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Country
                  </Label>
                  <Select value={form.country} onValueChange={handleCountryChange}>
                    <SelectTrigger
                      id="country"
                      className={`w-full rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.country ? "border-red-300" : ""
                        }`}
                    >
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryNames.map((name) => (
                        <SelectItem key={name} value={name} className="font-sans">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.country}</p>
                  )}
                </div>

                {/* Province / State — dropdown when the country has subdivisions,
                    otherwise a free-text fallback */}
                <div>
                  <Label
                    htmlFor="province"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Province / State
                  </Label>
                  {provinceRegions.length > 0 ? (
                    <Select
                      value={form.province}
                      onValueChange={(v) => handleChange("province", v)}
                    >
                      <SelectTrigger
                        id="province"
                        className={`w-full rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.province ? "border-red-300" : ""
                          }`}
                      >
                        <SelectValue placeholder="Select a province / state" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinceRegions.map((region) => (
                          <SelectItem key={region} value={region} className="font-sans">
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="province"
                      type="text"
                      value={form.province}
                      onChange={(e) => handleChange("province", e.target.value)}
                      disabled={!form.country}
                      placeholder={
                        form.country ? "State / region (optional)" : "Select a country first"
                      }
                      className="rounded-xl bg-gray-50 border-gray-200 font-sans"
                    />
                  )}
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.province}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city" className="font-sans font-bold text-gray-700 mb-1.5 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Toronto"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.city ? "border-red-300" : ""
                      }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.city}</p>
                  )}
                </div>

                {/* Postal code */}
                <div>
                  <Label
                    htmlFor="postalCode"
                    className="font-sans font-bold text-gray-700 mb-1.5 block"
                  >
                    Postal code
                  </Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    placeholder="e.g. M5V 2T6"
                    className={`rounded-xl bg-gray-50 border-gray-200 font-sans ${errors.postalCode ? "border-red-300" : ""
                      }`}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1 font-sans">{errors.postalCode}</p>
                  )}
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
