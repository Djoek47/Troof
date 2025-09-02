"use client"
import { useForm } from "react-hook-form"
import type { ShippingAddress } from "@/types/checkout"

interface ShippingStepProps {
  onSubmit: (data: ShippingAddress) => void
  initialData: ShippingAddress | null
}

export function ShippingStep({ onSubmit, initialData }: ShippingStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddress>({
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
    },
  })

  return (
    <div>
      <h2 className="text-2xl font-light mb-8 text-gray-900 tracking-tight">Shipping Address</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
                      <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              id="address1"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.address1 ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("address1", { required: "Address is required" })}
            />
            {errors.address1 && <p className="mt-1 text-sm text-red-500">{errors.address1.message}</p>}
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <input
              id="address2"
              type="text"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
              {...register("address2")}
            />
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              id="city"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.city ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("city", { required: "City is required" })}
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State/Province *
            </label>
            <input
              id="state"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.state ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("state", { required: "State is required" })}
            />
            {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP/Postal Code *
            </label>
            <input
              id="zipCode"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.zipCode ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("zipCode", { required: "ZIP code is required" })}
            />
            {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>}
          </div>
        </div>

                  <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              id="country"
              className={`w-full px-4 py-3 bg-white border ${
                errors.country ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("country", { required: "Country is required" })}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              className={`w-full px-4 py-3 bg-white border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
          </div>

        <div className="pt-6">
          <Button
            type="submit"
            className="w-full font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
          >
            Continue to Delivery
          </Button>
        </div>
      </form>
    </div>
  )
}
