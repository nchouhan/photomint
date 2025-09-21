import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// PhotoMint contract ABI (simplified for the frontend)
const PHOTOMINT_ABI = [
  "function mintWithProof(address to, bytes32 sha256Hash, bytes cidBytes, uint64 pHash, bytes signature, address creator, string tokenUri) returns (uint256)",
  "function photos(uint256 tokenId) view returns (bytes32 sha256Hash, bytes cidBytes, uint64 pHash, address creator, string tokenURI)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function verifyCreatorSignature(bytes32 sha256Hash, bytes cidBytes, bytes signature, address creator) view returns (bool)",
  "event Minted(uint256 indexed tokenId, address indexed to, address indexed creator, bytes32 sha256Hash, bytes cidBytes, uint64 pHash)"
]

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  isConnected: boolean
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToLocalNetwork: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  const isConnected = !!account

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask to use this application')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const accounts = await provider.send('eth_requestAccounts', [])
      const account = accounts[0]
      console.log('✅ Wallet connected to account:', account)
      setAccount(account)

      const signer = await provider.getSigner()
      setSigner(signer)

      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))

      // Create contract instance
      console.log('🔗 Creating contract with address:', CONTRACT_ADDRESS)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PHOTOMINT_ABI, signer)
      console.log('📄 Contract instance created:', contract)
      setContract(contract)

      // Check if we're on the correct network (local hardhat)
      if (Number(network.chainId) !== 31337) {
        toast.error('Please switch to local Hardhat network (Chain ID: 31337)')
        await switchToLocalNetwork()
      } else {
        toast.success(`Connected to ${account.slice(0, 6)}...${account.slice(-4)}`)
      }

    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setChainId(null)
    toast.success('Wallet disconnected')
  }

  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      })
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null,
              },
            ],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          toast.error('Failed to add local network')
        }
      } else {
        console.error('Error switching network:', switchError)
        toast.error('Failed to switch network')
      }
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
          toast.success('Account changed')
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        // Reload the page as recommended by MetaMask
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [account])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.send('eth_accounts', [])
          if (accounts.length > 0) {
            await connectWallet()
          }
        } catch (error) {
          console.error('Auto-connect failed:', error)
        }
      }
    }

    autoConnect()
  }, [])

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    contract,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToLocalNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
