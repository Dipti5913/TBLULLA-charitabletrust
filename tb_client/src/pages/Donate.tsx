// src/pages/Donate.tsx
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { toast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  // UI State
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [amount, setAmount] = useState<number>(1000);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [upiVpa, setUpiVpa] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  console.log('Donate form state:', { frequency, amount, name, email, paymentMethod, upiVpa, isSubmitting });

  const presetAmounts = [500, 1000, 2500, 5000];
  const loadRazorpay = (src: string) => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!name || !email || !amount || amount <= 0) {
      alert("Please fill in your name, email, and a valid amount.");
      return;
    }

    if (paymentMethod === "upi" && upiVpa && !/^[\w.-]+@[\w.-]+$/.test(upiVpa)) {
      alert("Please enter a valid UPI ID (e.g., name@bank).\nYou can also leave it blank and choose your UPI app in the checkout.");
      return;
    }

    setIsSubmitting(true);

    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsSubmitting(false);
      return;
    }

    const keyId = import.meta.env?.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere";

    const options: any = {
      key: keyId, // 👉 Set VITE_RAZORPAY_KEY_ID in your .env for production
      amount: Math.round(Number(amount) * 100), // Amount in paise
      currency: "INR",
      name: "Your Organization",
      description: frequency === "monthly" ? "Monthly Donation" : "One-time Donation",
      image: "https://yourlogo.com/logo.png", // optional: replace with your logo
      handler: function (response) {
        toast({ title: "Submited Sucessfully", variant: "success" });
        setIsSubmitting(false);
      },
      prefill: {
        name: name,
        email: email,
      },
      theme: {
        color: "#2563eb",
      },
      notes: {
        frequency,
        paymentMethod,
      },
      // Narrow the shown methods slightly based on selection (users can still switch in the widget)
      method: {
        upi: paymentMethod === "upi" ? 1 : 0,
        card: paymentMethod === "card" ? 1 : 0,
        netbanking: paymentMethod === "netbanking" ? 1 : 0,
        wallet: paymentMethod === "wallet" ? 1 : 0,
      },
    };

    // If UPI is selected and VPA provided, pass it to checkout (optional)
    if (paymentMethod === "upi" && upiVpa) {
      (options as any).upi = { vpa: upiVpa };
    }

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function () {
      setIsSubmitting(false);
    });
  };

  return (
    <Layout>
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Make a Difference
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Donate Today
              <span className="block text-blue-600">Transform Lives</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your generous contribution helps us continue our mission of creating positive change 
              in communities through education, healthcare, and sustainable development initiatives.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Donation Form */}
            <div className="lg:col-span-2">
              <div className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl p-8">
                {/* Card Border Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 pointer-events-none -z-10"></div>
                
                {/* Top accent border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 pointer-events-none -z-10" />

                <div className="relative z-10 mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Make Your Donation</h2>
                  <p className="text-gray-600">Your support empowers impactful programs and helps transform lives in our communities.</p>
                </div>

                {/* Form Content Container */}
                <div 
                  className="relative z-10" 
                  onClick={() => console.log('Form container clicked - accessibility test')}
                >
                
                {/* Frequency Toggle */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Donation Frequency</label>
                  <div className="inline-flex rounded-xl bg-gray-100 p-1">
                    <button
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${frequency === "one-time" ? "bg-white shadow-lg text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                      onClick={() => setFrequency("one-time")}
                    >
                      One-time
                    </button>
                    <button
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${frequency === "monthly" ? "bg-white shadow-lg text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                      onClick={() => setFrequency("monthly")}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Amount Presets */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`border-2 rounded-xl py-4 font-semibold transition-all duration-300 hover:scale-105 ${amount === amt ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg" : "border-gray-200 hover:border-blue-300 text-gray-700"}`}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-500 text-lg">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAmount(value === '' ? 0 : parseInt(value, 10) || 0);
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter custom amount"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Donor Details */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Information</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          console.log('Name input changed:', e.target.value);
                          setName(e.target.value);
                        }}
                        placeholder="Full Name *"
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          console.log('Email input changed:', e.target.value);
                          setEmail(e.target.value);
                        }}
                        placeholder="Email Address *"
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["upi", "card", "netbanking", "wallet"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`border-2 rounded-xl py-3 text-sm capitalize font-medium transition-all duration-300 hover:scale-105 ${paymentMethod === method ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg" : "border-gray-200 hover:border-blue-300 text-gray-700"}`}
                      >
                        {method === "upi" ? "UPI" : method === "netbanking" ? "Net Banking" : method.charAt(0).toUpperCase() + method.slice(1)}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="UPI ID (optional) - e.g., name@bank"
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-500 mt-2">Leave blank to choose your UPI app during checkout</p>
                    </div>
                  )}
                </div>
                
                </div> {/* End Form Content Container */}

                <button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Donate ₹${amount.toLocaleString("en-IN")} ${frequency === "monthly" ? "Monthly" : ""}`
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">🔒 Secure payments powered by Razorpay</p>
              </div>
            </div>

            {/* Impact Sidebar */}
            <div className="lg:col-span-1">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>
                
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4">Your Impact</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Every contribution helps us deliver essential services and create lasting change in communities across India.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-50 text-sm">Provide quality education resources to underprivileged children</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-50 text-sm">Support healthcare & hygiene programs in rural communities</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-50 text-sm">Enable emergency relief and rehabilitation efforts</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-50 text-sm">Empower women through skill development programs</p>
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <h4 className="font-semibold mb-2">Prefer Bank Transfer?</h4>
                    <div className="text-sm text-blue-100 space-y-1">
                      <p><span className="font-medium">Account:</span> 1234567890</p>
                      <p><span className="font-medium">IFSC:</span> ABCD0123456</p>
                      <p><span className="font-medium">Bank:</span> State Bank of India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentPage;
