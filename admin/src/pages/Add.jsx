import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { useAlert } from '../context/AlertContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Add = ({ token }) => {
    const alert = useAlert();
    // Images
    const [imageMain, setImageMain] = useState(false);
    const [gallery, setGallery] = useState([]);

    // Basic Info
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('Perfume');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');

    // Catalog Options
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Fragrance Profile
    const [concentration, setConcentration] = useState('EDP');
    const [character, setCharacter] = useState('Fresh');
    const [season, setSeason] = useState('Spring');
    const [occasion, setOccasion] = useState('Day');
    const [longevity, setLongevity] = useState('Moderate');
    const [sillage, setSillage] = useState('Moderate');
    const [isFeatured, setIsFeatured] = useState(false);

    // Dynamic Lists
    const [sizes, setSizes] = useState([{ sizeMl: '100ml', price: '', stock: 10 }]);
    const [notes, setNotes] = useState([{ noteName: '', type: 'TOP' }]);

    const fetchOptions = async () => {
        try {
            const catRes = await axios.get(`${backendUrl}/api/category/list`, { headers: { token } });
            const brandRes = await axios.get(`${backendUrl}/api/brand/list`, { headers: { token } });
            if (catRes.data.success) setCategories(catRes.data.categories);
            if (brandRes.data.success) setBrands(brandRes.data.brands);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    // Handlers for dynamic sizes
    const addSize = () => setSizes([...sizes, { sizeMl: '', price: '', stock: 10 }]);
    const removeSize = (index) => setSizes(sizes.filter((_, i) => i !== index));
    const updateSize = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    // Handlers for dynamic notes
    const addNote = () => setNotes([...notes, { noteName: '', type: 'TOP' }]);
    const removeNote = (index) => setNotes(notes.filter((_, i) => i !== index));
    const updateNote = (index, field, value) => {
        const newNotes = [...notes];
        newNotes[index][field] = value;
        setNotes(newNotes);
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGallery([...gallery, ...files]);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            const productData = {
                name, brand, category, subCategory, slug,
                shortDescription, fullDescription,
                concentration, character, season, occasion,
                longevity, sillage, isFeatured,
                sizes, notes
            };

            formData.append('productData', JSON.stringify(productData));
            if (imageMain) formData.append('imageMain', imageMain);
            gallery.forEach((file) => formData.append('gallery', file));

            const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
                headers: { token, 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                alert.success(response.data.message);
                // Reset logic here or navigate
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-10">
            {/* Section: Basic Info */}
            <Card title="1. Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. bleu-de-chanel" required />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Brand</label>
                        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <Input label="Sub-Category" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} placeholder="e.g. Perfume" />

                    <div className="flex items-center gap-3 self-end mb-3">
                        <input type="checkbox" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} id="featured" className="w-4 h-4 text-primary-600 rounded" />
                        <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">Featured Product</label>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Short Summary</label>
                        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Full Story (Rich Description)</label>
                        <textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="5" placeholder="Narrate the inspiration behind this fragrance..." />
                    </div>
                </div>
            </Card>

            {/* Section: Imagery */}
            <Card title="2. Product Imagery">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="mb-3 text-sm font-medium text-gray-700">Main Hero Image</p>
                        <label htmlFor="imageMain" className="cursor-pointer block w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative group">
                            <img className="w-full h-full object-cover" src={!imageMain ? assets.upload_area : URL.createObjectURL(imageMain)} alt="" />
                            <input type="file" id="imageMain" onChange={(e) => setImageMain(e.target.files[0])} hidden accept="image/*" />
                        </label>
                    </div>
                    <div>
                        <p className="mb-3 text-sm font-medium text-gray-700">Gallery Images</p>
                        <div className="flex flex-wrap gap-4">
                            {gallery.map((file, i) => (
                                <div key={i} className="w-20 h-20 border border-gray-200 rounded-lg relative overflow-hidden">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <label className="cursor-pointer flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500">
                                <span className="text-2xl text-gray-400">+</span>
                                <input type="file" multiple onChange={handleGalleryChange} hidden accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Section: Olfactory Pyramid & Profile */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <Card title="3. Olfactory Pyramid">
                    <div className="flex flex-col gap-4">
                        {notes.map((note, index) => (
                            <div key={index} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Input label={`Note ${index + 1}`} value={note.noteName} onChange={(e) => updateNote(index, 'noteName', e.target.value)} placeholder="e.g. Calabrian Bergamot" />
                                </div>
                                <select value={note.type} onChange={(e) => updateNote(index, 'type', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md mb-0.5 h-[42px]">
                                    <option value="TOP">Top Note</option>
                                    <option value="HEART">Heart Note</option>
                                    <option value="BASE">Base Note</option>
                                </select>
                                <button type="button" onClick={() => removeNote(index)} className="text-red-500 mb-2 font-bold px-2">×</button>
                            </div>
                        ))}
                        <button type="button" onClick={addNote} className="text-primary-600 font-medium text-sm self-start mt-2">+ Add Another Note</button>
                    </div>
                </Card>

                <Card title="4. Fragrance Profile">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Concentration</label>
                            <select value={concentration} onChange={(e) => setConcentration(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['EDP', 'EDT', 'Parfum', 'Extrait'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Longevity</label>
                            <select value={longevity} onChange={(e) => setLongevity(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['Weak', 'Moderate', 'Long Lasting', 'Eternal'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Season</label>
                            <select value={season} onChange={(e) => setSeason(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['Spring', 'Summer', 'Autumn', 'Winter', 'All Season'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Character</label>
                            <select value={character} onChange={(e) => setCharacter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['Woody', 'Floral', 'Fresh', 'Oriental', 'Citrus', 'Spicy', 'Leathery', 'Sweet'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Occasion</label>
                            <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['Day', 'Night', 'Professional', 'Romantic', 'Casual', 'Formal', 'Sport'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Sillage</label>
                            <select value={sillage} onChange={(e) => setSillage(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                                {['Intimate', 'Moderate', 'Strong', 'Enormous'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Section: Inventory & Sizes */}
            <Card title="5. Inventory & Sizes">
                <div className="flex flex-col gap-6">
                    {sizes.map((size, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b border-gray-100 pb-6 last:border-0">
                            <Input label="Size (e.g. 100ml)" value={size.sizeMl} onChange={(e) => updateSize(index, 'sizeMl', e.target.value)} placeholder="100ml" required />
                            <Input label="Price (₹)" type="number" value={size.price} onChange={(e) => updateSize(index, 'price', e.target.value)} placeholder="0" required />
                            <Input label="Stock" type="number" value={size.stock} onChange={(e) => updateSize(index, 'stock', e.target.value)} placeholder="10" required />
                            <button type="button" onClick={() => removeSize(index)} className="text-red-500 mb-2 font-medium text-left">Remove Size</button>
                        </div>
                    ))}
                    <button type="button" onClick={addSize} className="text-primary-600 font-medium text-sm self-start">+ Add Another Size Option</button>
                </div>
            </Card>

            <div className="flex gap-4 justify-end">
                <Button type="submit" variant="primary" size="lg" className="px-12">Submit Product to Catalog</Button>
            </div>
        </form>
    );
};

export default Add;
