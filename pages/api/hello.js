// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const users = [{ name: 'NFT01' }, { name: 'NFT02' }, { name: 'NFT03' }]

export default function handler(req, res) {
    //res.status(200).json({ name: 'John Doe' })
    res.status(200).json(users)
}