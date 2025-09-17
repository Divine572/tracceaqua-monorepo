import { QRGenerator } from "@/components/qr-code/QRGenerator"

const QRCode = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <QRGenerator/>
        </div>
    )
}

export default QRCode