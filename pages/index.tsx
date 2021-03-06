
   
import WalletConnectProvider from '@walletconnect/web3-provider'
import { providers, ethers } from 'ethers'
import { useState , useCallback, useEffect, useReducer } from 'react'
import WalletLink from 'walletlink'
import Web3Modal from 'web3modal'
import axios from 'axios'
import { ellipseAddress, getChainData } from '../lib/utilities'
import NftCard from './NftCard'
import useSwr from 'swr'

import NFT from '../contracts/NFT.json'
import Market from '../contracts/NFTMarket.json'

//const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'
const INFURA_ID = 'eabb028e669541b2905db4adfa2378bb'
const nftaddress = '0x534e701eb18289eFc670e9b5b18C1BBa9F8ccB56'
const nftmarketaddress = '0x8520c2C7a64732906a173c1C44CC3DC857d9Ff05'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID, // required
    },
  },
  'custom-walletlink': {
    display: {
      logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
      name: 'Coinbase',
      description: 'Connect to Coinbase Wallet (not Coinbase App)',
    },
    options: {
      appName: 'Coinbase', // Your app name
      networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 1,
    },
    package: WalletLink,
    connector: async (_, options) => {
      const { appName, networkUrl, chainId } = options
      const walletLink = new WalletLink({
        appName,
      })
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
      await provider.enable()
      return provider
    },
  },
}

let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions, // required
  })
}

type StateType = {
  provider?: any
  web3Provider?: any
  address?: string
  chainId?: number
}

type ActionType =
  | {
      type: 'SET_WEB3_PROVIDER'
      provider?: StateType['provider']
      web3Provider?: StateType['web3Provider']
      address?: StateType['address']
      chainId?: StateType['chainId']
    }
  | {
      type: 'SET_ADDRESS'
      address?: StateType['address']
    }
  | {
      type: 'SET_CHAIN_ID'
      chainId?: StateType['chainId']
    }
  | {
      type: 'RESET_WEB3_PROVIDER'
    }

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      }
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      }
    case 'RESET_WEB3_PROVIDER':
      return initialState
    default:
      throw new Error()
  }
}

export const Home = (): JSX.Element => {
  const fetcher = (url) => fetch(url).then((res) => res.json())
  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, web3Provider, address, chainId } = state

  const connect = useCallback(async function () {
    // This is the initial `provider` that is returned when
    // using web3Modal to connect. Can be MetaMask or WalletConnect.
    const provider = await web3Modal.connect()

    // We plug the initial `provider` into ethers.js and get back
    // a Web3Provider. This will add on methods from ethers.js and
    // event listeners such as `.on()` will be different.
    const web3Provider = new providers.Web3Provider(provider)

    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()

    const network = await web3Provider.getNetwork()
    //const balance = web3Provider.getBalance("0x6E2A497a065674AB8b129fD7DdB301c6243C6362")
    //console.log('balance: ' + balance);
    web3Provider.getBalance(address).then((balance) => {
      // convert a currency unit from wei to ether
      const balanceInEth = ethers.utils.formatEther(balance)
      console.log(`balance: ${balanceInEth} ETH`)
     })
    

    dispatch({
      type: 'SET_WEB3_PROVIDER',
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
    })
  }, [])

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider()
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect()
      }
      dispatch({
        type: 'RESET_WEB3_PROVIDER',
      })
    },
    [provider]
  )

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts)
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        })
      }

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload()
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error)
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect])

  const chainData = getChainData(chainId)
  //const { data, error } = useSwr('/api/hello', fetcher)

  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {    
    //const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const provider = await web3Modal.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, web3Provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, web3Provider)
    const data = await marketContract.fetchMarketItems()
    console.log('111')
    console.log(data)
    const items = await Promise.all(data.map(async i => {
      
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  async function buyNft(nft) {
    //const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.itemId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }

  return (
      <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
        <div className="">
          <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
            <div className="flex-none">
              <button className="btn btn-square btn-ghost">
                <span className="text-4xl">????</span>
              </button>
            </div>
            <div className="flex-1 px-2 mx-2">
              <div className="text-sm breadcrumbs">
                <ul className="text-xl">
                  {/* <li>
                    <Link href="/">
                      <a>Templates</a>
                    </Link>
                  </li> */}
                  <li>
                    <span className="opacity-40">Viettel NFT Marketplace</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-none">
              {web3Provider ? (<button className="btn" onClick={disconnect}>
                <span className="text-sm">{chainData?.name + " - " + ellipseAddress(address)}</span>
              </button>) : (<button className="btn" onClick={connect}>
                <span className="text-sm">Connect wallet</span>
              </button>)}
            </div>
          </div>
  
          {/* <div className="text-center pt-2">
            <div className="hero min-h-16 p-0 pt-10">
              <div className="text-center hero-content w-full">
                <div className="w-full">
                  <h1 className="mb-5 text-5xl">
                    Viettel NFT Marketplace
                  </h1>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
        {nfts?.map((nft, i) => (
          <NftCard key={i} details={nft} onSelect={() => {}} onClickBuy={() => buyNft(nft)}  />
        ))}
        </div>
        
       
      </div>
  )
}

export default Home