import React, { useState } from 'react';
import './contact.css';
import { assets } from '../assets/assets';
import { useAlert } from '../context/AlertContext';
import api from '../api/api';

import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Title from '../components/Title';

const Contact = () => {
  const alert = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      alert.error('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/contact', formData);
      if (response.data.success) {
        alert.success('Your message has been sent!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert.error(response.data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='pt-10 border-t border-gray-100'>
      <div className='text-3xl font-bold mb-12'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='flex flex-col md:flex-row gap-16 items-start mb-24'>

        <div className='w-full md:w-1/2'>
          <div className='relative'>
            <img className='w-full rounded-3xl shadow-xl theme-border' src={assets.contact_img} alt="Contact Fragrance Heaven" />
            <div className='absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-2xl hidden lg:block theme-border border border-gray-50'>
              <p className='text-xs font-bold text-[#FFD1DC] uppercase tracking-widest mb-2'>Headquarters</p>
              <p className='text-gray-800 font-bold'>123 Luxury Lane</p>
              <p className='text-gray-500'>New York, NY 10001, USA</p>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/2 bg-white p-8 sm:p-12 rounded-3xl shadow-xl theme-border border border-gray-50'>
          <div className='mb-8'>
            <h2 className='prata-regular text-3xl text-gray-800 mb-2'>Send a Message</h2>
            <div className='w-12 h-1 bg-[#FFD1DC] rounded-full'></div>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <Input
              name="name"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="subject"
              label="Subject"
              placeholder="How can we help?"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <div className='flex flex-col gap-2'>
              <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Message</label>
              <textarea
                name="message"
                placeholder="Your message to our team..."
                rows="4"
                className='w-full border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium text-gray-700 outline-none focus:border-[#FFD1DC] focus:ring-4 focus:ring-[#FFF0F5] transition-all'
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <Button type="submit" variant="secondary" className="w-full mt-4" disabled={loading}>
              {loading ? 'Sending Message...' : 'Send Message'}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
