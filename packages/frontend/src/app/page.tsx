import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-primary mb-4">TracceAqua</h1>
        <p className="text-muted-foreground">
          Blockchain Seafood Traceability System
        </p>
        <div className="mt-6 p-4 border border-border rounded-lg bg-card">
          <p className="text-card-foreground">CSS is working! 🎉</p>
        </div>
      </div>
    </main>
  )
}