export const metadata = {
  title: 'DSC Smart Contract Backend API',
  description: 'RESTful API for interacting with DSC (Decentralized Stable Coin) smart contract',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 