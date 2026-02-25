import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { useAlert } from '../context/AlertContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Brand = ({ token }) => {
    const alert = useAlert();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brands, setBrands] = useState([]);

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/brand/list`, { headers: { token } });
            if (response.data.success) {
                setBrands(response.data.brands);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/brand/add`, { name, description }, { headers: { token } });
            if (response.data.success) {
                alert.success(response.data.message);
                setName('');
                setDescription('');
                fetchBrands();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            alert.error(error.message);
        }
    };

    const removeBrand = async (id) => {
        const confirmed = await alert.confirm(
            "Remove Brand",
            "Are you sure you want to remove this brand? All products associated with this brand will be updated."
        );

        if (!confirmed) return;

        try {
            const response = await axios.post(`${backendUrl}/api/brand/remove`, { id }, { headers: { token } });
            if (response.data.success) {
                alert.success(response.data.message);
                fetchBrands();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            alert.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Card title="Manage Brands">
                <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Brand Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Chanel"
                            required
                        />
                        <div className="flex flex-col gap-2">
                            <label className='block text-sm font-medium text-gray-700'>Brand Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary-600'
                                placeholder="Brand heritage..."
                            />
                        </div>
                    </div>
                    <Button type="submit" className="self-end">Add Brand</Button>
                </form>
            </Card>

            <Card title="Brand List">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-600">
                            <tr>
                                <th className="px-6 py-4 border-b">Brand Name</th>
                                <th className="px-6 py-4 border-b">Description</th>
                                <th className="px-6 py-4 border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b font-medium">{item.name}</td>
                                    <td className="px-6 py-4 border-b text-gray-500 truncate max-w-xs">{item.description}</td>
                                    <td className="px-6 py-4 border-b text-right">
                                        <button
                                            onClick={() => removeBrand(item.id)}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Brand;
