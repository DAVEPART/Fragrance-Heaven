import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Coupons = ({ token }) => {

    const [coupons, setCoupons] = useState([])
    const [stats, setStats] = useState({ issued: 0, used: 0, expired: 0 })
    const [loading, setLoading] = useState(true)

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const response = await axios.get(backendUrl + '/api/admin/coupons/list', { headers: { token } })
            if (response.data.success) {
                setCoupons(response.data.coupons || [])
                setStats({
                    issued: response.data.totalIssued || 0,
                    used: response.data.totalUsed || 0,
                    expired: response.data.totalExpired || 0
                })
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchCoupons()
        }
    }, [token])

    if (loading) {
        return <div className="text-center py-20 text-gray-500 text-lg">Loading Coupons...</div>
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Marketing Coupons</h1>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-primary-100 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Issued</p>
                    <p className="text-3xl font-bold text-primary-600">{stats.issued}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Used</p>
                    <p className="text-3xl font-bold text-green-600">{stats.used}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Expired</p>
                    <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-800 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Required Min</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Expires At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => {
                                const isExpired = new Date(coupon.expireAt).getTime() < new Date().getTime();
                                let statusBadge = <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Active</span>;
                                if (coupon.isUsed) {
                                    statusBadge = <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Used</span>;
                                } else if (isExpired) {
                                    statusBadge = <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Expired</span>;
                                }

                                return (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 tracking-wider bg-gray-50 border-r border-gray-100">{coupon.code}</td>
                                        <td className="px-6 py-4">#{coupon.userId}</td>
                                        <td className="px-6 py-4 text-primary-600 font-semibold">{coupon.discountPercent}%</td>
                                        <td className="px-6 py-4">{currency}{coupon.minimumOrderAmount}</td>
                                        <td className="px-6 py-4">{statusBadge}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{new Date(coupon.expireAt).toLocaleDateString()}</td>
                                    </tr>
                                )
                            })}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No coupons issued yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Coupons
