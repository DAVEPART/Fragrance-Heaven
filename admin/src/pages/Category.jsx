import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { useAlert } from '../context/AlertContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Category = ({ token }) => {
    const alert = useAlert();
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/category/list`, { headers: { token } });
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/category/add`, { name }, { headers: { token } });
            if (response.data.success) {
                alert.success(response.data.message);
                setName('');
                fetchCategories();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            alert.error(error.message);
        }
    };

    const removeCategory = async (id) => {
        const confirmed = await alert.confirm(
            "Remove Category",
            "Are you sure you want to remove this category? All products in this category might be affected."
        );

        if (!confirmed) return;

        try {
            const response = await axios.post(`${backendUrl}/api/category/remove`, { id }, { headers: { token } });
            if (response.data.success) {
                alert.success(response.data.message);
                fetchCategories();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            alert.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Card title="Manage Categories">
                <form onSubmit={onSubmitHandler} className="flex gap-4 items-end">
                    <Input
                        label="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Men"
                        required
                    />
                    <Button type="submit">Add Category</Button>
                </form>
            </Card>

            <Card title="Category List">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-600">
                            <tr>
                                <th className="px-6 py-4 border-b">Category Name</th>
                                <th className="px-6 py-4 border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b">{item.name}</td>
                                    <td className="px-6 py-4 border-b text-right">
                                        <button
                                            onClick={() => removeCategory(item.id)}
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

export default Category;
