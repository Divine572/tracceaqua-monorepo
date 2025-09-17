"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import {
  QrCode,
  Shield,
  Users,
  Waves,
  ChevronRight,
  Microscope,
  Truck,
} from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import useAuthStore from "@/stores/auth-store";
import Cookies from "universal-cookie";

export default function Home() {
  const { primaryWallet, user } = useDynamicContext();

  const router = useRouter();

  const { setSignature, email } =
    useAuthStore();
  const { setUser } = useAuthStore();

  const cookie = new Cookies();

  const message =
    "Welcome to TracceAqua! This request will not trigger a blockchain transaction...";

  useEffect(() => {

    const userToken = cookie.get("user-token");

    if (userToken && userToken !== "undefined" && userToken !== "null") {
      return;
    }

    if (primaryWallet && user) {
      const setSignedMessage = async () => {
        const signature = await primaryWallet.signMessage(message);
        console.log(signature);
        setSignature(signature);
        const walletAddress = primaryWallet.address

        return {signature, wallet: walletAddress}
      };

      if (user.newUser) {
        const registerUser = async () => {
          const result = await setSignedMessage();
          const userData = {
            email: email ? email : "",
            address: result.wallet,
            signature: result.signature,
            message: message,
            firstName: "",
            lastName: "",
          };

          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
            });

            if (!response.ok)
              throw new Error("Failed to register user. Please try again");

            const responseData = await response.json();
            const data = responseData.data;
            console.log(data);
            cookie.set("user-token", data.data.accessToken, {
              path: "/",
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              secure: true,
              sameSite: "strict",
            });
            const savedUser = data.data.user;
            setUser(savedUser);
            router.push("/dashboard");
          } catch (error) {
            console.log(error);
            toast.error("Failed to register user. Please try again");
          }
        };

        registerUser();
      }

      if (!user.newUser) {
        console.log("login");
        const loginUser = async () => {
          console.log("login2");
          const result = await setSignedMessage();
          const userData = {
            email: email ? email : "",
            address: result.wallet,
            signature: result.signature,
            message: message,
          };

          try {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
            });

            if (!response.ok)
              throw new Error("Failed to register user. Please try again");

            const responseData = await response.json();
            const data = responseData.data;
            console.log(data);
            cookie.set("user-token", data.data.accessToken, {
              path: "/",
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              secure: true,
              sameSite: "strict",
            });
            const savedUser = data.data.user;
            setUser(savedUser);
            router.push("/dashboard");
          } catch (error) {
            toast.error("Failed to register user. Please try again");
          }
        };

        loginUser();
      }
    }
  }, [primaryWallet, user, email, router, message]);

  const onBoarding = () => {
    const userToken = cookie.get("user-token")

    if (userToken && primaryWallet) {
      router.push("/dashboard");
    } else {
      router.push("/auth/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 tracce-gradient opacity-5" />
        <div className="container max-w-6xl mx-auto text-center relative">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full tracce-gradient flex items-center justify-center">
              <Waves className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Welcome to{" "}
            <span className="bg-clip-text">
              TracceAqua
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your trusted partner for traceability and conservation in the
            Nigerian shellfish supply chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link href="/auth/onboarding"> */}
            <Button
              size="lg"
              // variant="tracce"
              className="px-8"
              onClick={onBoarding}
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            {/* </Link> */}
            <Link href="/scan">
              <Button size="lg" variant="outline" className="px-8">
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            For All Stakeholders
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg tracce-gradient flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Trace With Ease</CardTitle>
                <CardDescription>
                  Consumers can simply scan a QR code to get the full history
                  and origin of their shellfish product.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg tracce-gradient flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Blockchain Security</CardTitle>
                <CardDescription>
                  Immutable records on Ethereum ensure transparency and trust
                  throughout the entire supply chain.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg tracce-gradient flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Multi-Stakeholder</CardTitle>
                <CardDescription>
                  Designed for harvesters, processors, transporters, inspectors,
                  and consumers in one platform.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Two Powerful Modules
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="tracce-shadow border-0">
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                  <Microscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Conservation Module</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive sampling forms, water quality monitoring, lab
                  results, and environmental impact tracking for wild-capture
                  shellfish.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    5-step sampling process
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Water quality parameters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Lab result integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Environmental monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="tracce-shadow border-0">
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Supply Chain Module</CardTitle>
                <CardDescription className="text-base">
                  End-to-end traceability from harvest to consumer, supporting
                  both farmed and wild-capture seafood products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Batch creation & tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Stage-by-stage updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    QR code generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Consumer verification
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 tracce-gradient text-white">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join TracceAqua today and be part of the future of sustainable
            seafood traceability.
          </p>
          {/* <Link href="/auth/onboarding"> */}
          <Button
            size="lg"
            variant="secondary"
            className="px-8"
            onClick={onBoarding}
          >
            Start Your Journey
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          {/* </Link> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-full tracce-gradient flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            © 2024 TracceAqua. Powered by blockchain technology for sustainable
            seafood.
          </p>
        </div>
      </footer>
    </div>
  );
}
