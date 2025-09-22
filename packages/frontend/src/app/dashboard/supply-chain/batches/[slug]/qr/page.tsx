import { QRGenerator } from "@/components/qr-code/QRGenerator";
import { FC } from "react";

interface QrProps {
  params: { slug: string };
}

const QRCode: FC<QrProps> = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <QRGenerator productId={slug} />
    </div>
  );
};

export default QRCode;
