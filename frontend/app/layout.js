'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/Components/Header'
import '@rainbow-me/rainbowkit/styles.css';
import {

  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  arbitrum, hardhat
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';



const { chains, publicClient } = configureChains(
  [arbitrum, hardhat],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'NFTTickets',
  projectId: 'fb441fb860280834daeef370f2c7bc01',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})


const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Header/>
            <main>{children}</main>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>

    </html>
  )
}
