import Image from "next/image"

export function ProRiderLogo({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Image
      src="/logo.png"
      alt="ProRider"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
