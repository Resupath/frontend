export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="w-screen h-screen z-[1000]">{children}</div>;
}
